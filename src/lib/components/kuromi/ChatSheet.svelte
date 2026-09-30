<script lang="ts">
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { resolvePath } from '$lib/paths';
	import { X, Maximize2, History } from 'lucide-svelte';
	import { getGameContext } from '$lib/state/context';
	import { getTodayDate } from '$lib/match/engine';
	import { capHistory, readLegacyChat, commitLegacyChatImport } from '$lib/kuromi/history';
	import {
		newConversation,
		appendToConversation,
		deriveTitle,
		capConversations,
		upsertConversation,
		sortByRecency
	} from '$lib/kuromi/conversations';
	import { buildKuromiContext } from '$lib/kuromi/context';
	import { readKuromiFocus } from '$lib/kuromi/focus';
	import { takePendingDrill } from '$lib/kuromi/coachTools';
	import { WIFI_FALLBACK } from '$lib/kuromi/lines';
	import { sendKuromiChat, sendKuromiToolResults } from '$lib/kuromi/client';
	import type { KuromiClientResult } from '$lib/kuromi/client';
	import { chooseReplyWhenPendingEmpty, executeIntents } from '$lib/kuromi/executor';
	import type {
		KuromiTurn,
		KuromiErrorCode,
		KuromiContextPacket,
		KuromiToolCall,
		StewardToolResult
	} from '$lib/kuromi/types';
	import type { KuromiConversation } from '$lib/state/schema';
	import { buildPageAnnouncement, type PageAnnouncement } from '$lib/kuromi/announce';
	import { PROFILES } from '$lib/profiles/profiles';
	import Bubble from '$lib/components/ui/Bubble.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import ConversationList from './ConversationList.svelte';
	import InlineQuestion from './InlineQuestion.svelte';
	import { parseReply, type CharacterMoodRef } from '$lib/kuromi/mood';
	import { addToast } from '$lib/components/toastStore';
	import { playSfx } from '$lib/sound/sfx';

	interface Props {
		open: boolean;
		/** 'sheet' = bottom modal over current route; 'inline' = full-page embed (later lane). */
		presentation?: 'sheet' | 'inline';
		onClose?: () => void;
		activeConversationId?: string | null;
	}

	let {
		open,
		presentation = 'sheet',
		onClose,
		activeConversationId = $bindable(null)
	}: Props = $props();

	const ctx = getGameContext();

	let messages = $state<KuromiTurn[]>([]);
	let announcementsByIndex = $state<Record<number, PageAnnouncement[]>>({});
	let draft = $state('');
	let sending = $state(false);
	let errorCode = $state<KuromiErrorCode | 'network' | null>(null);
	let transcriptEl: HTMLDivElement | undefined = $state();
	let closeBtnEl: HTMLButtonElement | undefined = $state();
	let inputEl: HTMLTextAreaElement | undefined = $state();
	// Dialog root — focusable via tabindex="-1" so focus can land on the
	// dialog itself on open (standard modal pattern; also what makes the
	// role="dialog" element satisfy a11y_interactive_supports_focus).
	let dialogEl: HTMLDivElement | undefined = $state();
	let historyBtnEl: HTMLButtonElement | undefined = $state();
	let historyDialogEl: HTMLDivElement | undefined = $state();
	// Element that held focus immediately before the sheet hijacked it.
	let openerEl: HTMLElement | null = null;
	let showHistoryOverlay = $state(false);
	let loadedConversationKey = $state<string | undefined>(undefined);
	let autoSelectDoneForProfile: string | undefined = undefined;
	let pendingLegacyImport: KuromiConversation | null = null;
	let legacyImportSettledForProfile: string | undefined = undefined;

	// Drag-to-dismiss (sheet only)
	let dragY = $state(0);
	let dragging = $state(false);
	let dragStartY = 0;

	const isSheet = $derived(presentation === 'sheet');

	let isDesktopPanel = $state(false);
	let prefersReducedMotionUI = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(min-width: 768px)');
		isDesktopPanel = mq.matches;
		const onChange = () => {
			isDesktopPanel = mq.matches;
		};
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotionUI = mq.matches;
		const onChange = () => {
			prefersReducedMotionUI = mq.matches;
		};
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	const REACT_JIT = ['jit-1', 'jit-2', 'jit-3', 'jit-4', 'jit-5', 'jit-6', 'jit-7'] as const;

	function reactJitClass(mood: string): string {
		let sum = 0;
		for (let i = 0; i < mood.length; i++) sum += mood.charCodeAt(i);
		return REACT_JIT[sum % REACT_JIT.length];
	}

	// Defensive display-time strip: guarantees no raw [mood:]/[sticker:]/[react:]
	// tag ever reaches a bubble, even in mood.ts's own "tag-only reply" fallback
	// case (see mood.ts STEP 4, which intentionally returns the raw string when
	// nothing but tags remain) or an unforeseen parser edge case. Belt-and-suspenders.
	const RAW_TAG_RE = /\[\s*(?:mood|sticker|react)\s*:[^\]]*\]|\[\s*\/?\s*question\s*\]/gi;
	const EMPTY_FALLBACK = '…';

	function escapeHtml(s: string): string {
		return s
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	// Conservative markdown emphasis: only converts well-formed **strong** / *em*
	// pairs (CommonMark-style flanking -- not preceded/followed by a word char or
	// another asterisk, no leading/trailing space just inside the pair). A lone or
	// unpaired asterisk (e.g. "5*6=30" or "note*") is left as plain text, never eaten,
	// same principle as the tag-parsing rules in mood.ts.
	const STRONG_RE = /(?<![\w*])\*\*(?!\s)([^*\n]+?)(?<!\s)\*\*(?!\w)/g;
	const EM_RE = /(?<![\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?!\w)/g;

	function renderInline(raw: string): string {
		const withoutTags = raw.replace(RAW_TAG_RE, '').trim();
		const safe = withoutTags === '' ? EMPTY_FALLBACK : withoutTags;
		const escaped = escapeHtml(safe);
		const withStrong = escaped.replace(STRONG_RE, '<strong>$1</strong>');
		const withEm = withStrong.replace(EM_RE, '<em>$1</em>');
		return withEm;
	}

	function buildReactMap(turns: KuromiTurn[]): Record<number, CharacterMoodRef> {
		const map: Record<number, CharacterMoodRef> = {};
		for (let i = 0; i < turns.length; i++) {
			if (turns[i].role !== 'assistant') continue;
			const { react } = parseReply(turns[i].content);
			if (!react) continue;
			for (let j = i - 1; j >= 0; j--) {
				if (turns[j].role === 'user') {
					map[j] = react;
					break;
				}
			}
		}
		return map;
	}

	const reactByUserIndex = $derived(buildReactMap(messages));

	function sulkMessage(_code: KuromiErrorCode | 'network'): string {
		return WIFI_FALLBACK;
	}

	async function buildTurnContext() {
		return buildKuromiContext($page.url.pathname, ctx.state, getTodayDate(), readKuromiFocus());
	}

	function close() {
		if (isSheet) {
			const isVisiblyFocusable = (el: unknown): el is HTMLElement =>
				el instanceof HTMLElement && el.isConnected && el.offsetParent !== null;

			if (isVisiblyFocusable(openerEl)) {
				openerEl.focus();
			} else {
				const rantBtn = document.querySelector('.rant-btn');
				if (isVisiblyFocusable(rantBtn)) {
					rantBtn.focus();
				} else {
					const main = document.querySelector<HTMLElement>('main');
					if (main) {
						if (!main.hasAttribute('tabindex')) {
							main.setAttribute('tabindex', '-1');
						}
						main.focus();
					} else {
						document.body.focus?.();
					}
				}
			}
			openerEl = null;
		}
		onClose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			close();
			return;
		}

		// Sheet mode only: trap Tab so it cannot walk into the page behind the backdrop.
		// Inline mode must keep native tab order so focus can leave this embed.
		if (!isSheet || e.key !== 'Tab') return;

		const selector =
			'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
		const list = dialogEl
			? Array.from(dialogEl.querySelectorAll<HTMLElement>(selector)).filter(
					(el) => el.offsetParent !== null
				)
			: [];

		if (list.length === 0) {
			e.preventDefault();
			dialogEl?.focus();
			return;
		}

		const active = document.activeElement;
		const activeIndex = active instanceof HTMLElement ? list.indexOf(active) : -1;
		e.preventDefault();
		if (e.shiftKey) {
			const previousIndex = activeIndex <= 0 ? list.length - 1 : activeIndex - 1;
			list[previousIndex].focus();
		} else {
			const nextIndex = activeIndex === -1 || activeIndex === list.length - 1 ? 0 : activeIndex + 1;
			list[nextIndex].focus();
		}
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	// Reload transcript when the active conversation (or profile) changes
	$effect(() => {
		const id = activeConversationId;
		const key = `${ctx.activeProfile}:${id ?? 'draft'}`;
		if (key === loadedConversationKey) return;
		loadedConversationKey = key;
		const found = id ? ctx.state.conversations.find((c) => c.id === id) : undefined;
		messages = found ? found.turns : [];
		announcementsByIndex = {};
		errorCode = null;
	});

	// Reload transcript when the sheet opens for this profile
	$effect(() => {
		if (open) {
			// Capture the opener before we move focus onto the dialog. Guard so a
			// re-run (e.g. profile switch while already open) does not overwrite it.
			if (isSheet && !openerEl) {
				const active = document.activeElement;
				if (active instanceof HTMLElement) {
					openerEl = active;
				}
			}
			announcementsByIndex = {};
			errorCode = null;
			sending = false;
			dragY = 0;
			void tick().then(() => {
				// Focus the dialog container itself (tabindex="-1" makes this valid),
				// not a descendant button — keeps the a11y contract and the actual
				// focus target consistent with each other.
				dialogEl?.focus();
				scrollToBottom();
			});
		}
	});

	// Self-healing: keeps re-applying the legacy-transcript import until it is
	// actually present in ctx.state.conversations, and picks an initial active
	// conversation. This effect is deliberately NOT gated on `open` and reruns
	// on every ctx.state.conversations change, which makes it immune to
	// +layout.svelte's onMount doing `gameState = loadState(...)` (a wholesale
	// reassignment that can otherwise silently discard a mount-time write made
	// before that onMount fires -- confirmed via headless testing). Auto-select
	// runs at most once per profile; any later null active id is treated as a
	// deliberate "start new" (from ChatSheet or the hub's standalone list).
	// Two-phase legacy import: read first (no writes); commit only after the
	// folded conversation is confirmed present in synced state (or immediately
	// with imported:false for nothing-to-import).
	$effect(() => {
		if (legacyImportSettledForProfile !== ctx.activeProfile) {
			if (!pendingLegacyImport) {
				const read = readLegacyChat(ctx.activeProfile, ctx.steward.nowISO(), ctx.steward.newId());
				if (read.status === 'found') {
					pendingLegacyImport = read.conversation;
				} else if (read.status === 'nothing-to-import') {
					commitLegacyChatImport(ctx.activeProfile, false);
					legacyImportSettledForProfile = ctx.activeProfile;
				} else {
					// already-imported — never call commit for this result
					legacyImportSettledForProfile = ctx.activeProfile;
				}
			}
			if (pendingLegacyImport) {
				const stillMissing = !ctx.state.conversations.some((c) => c.id === pendingLegacyImport!.id);
				if (stillMissing) {
					ctx.state.conversations = capConversations(
						upsertConversation(ctx.state.conversations, pendingLegacyImport)
					);
					return;
				}
				commitLegacyChatImport(ctx.activeProfile, true);
				legacyImportSettledForProfile = ctx.activeProfile;
				pendingLegacyImport = null;
			}
		}

		if (autoSelectDoneForProfile !== ctx.activeProfile) {
			autoSelectDoneForProfile = ctx.activeProfile;
			if (
				activeConversationId === null ||
				!ctx.state.conversations.some((c) => c.id === activeConversationId)
			) {
				const recent = sortByRecency(ctx.state.conversations)[0];
				activeConversationId = recent ? recent.id : null;
			}
		}
	});

	// Focus the history overlay dialog when it opens so Tab lands inside it
	// (the overlay is portaled to document.body, outside dialogEl's trap).
	$effect(() => {
		if (showHistoryOverlay) {
			void tick().then(() => {
				historyDialogEl?.focus();
			});
		}
	});

	function scrollToBottom() {
		if (transcriptEl) {
			transcriptEl.scrollTop = transcriptEl.scrollHeight;
		}
	}

	async function requestReply(
		turns: KuromiTurn[],
		context: KuromiContextPacket
	): Promise<KuromiClientResult> {
		return sendKuromiChat(ctx.activeProfile, {
			mode: 'chat',
			messages: turns,
			context
		});
	}

	/** RULE 3: every call dropped — nothing changed. */
	const FALLBACK_NOTHING_CHANGED =
		"Whatever that was supposed to be, I'm pretending it never happened. [mood: hmph]";
	/** RULE 4: state already mutated; leg-2 narration failed. */
	const FALLBACK_CHANGED_NO_NARRATION =
		"I already did it. Don't make me narrate myself twice. [mood: wink]";

	/** Shift announcement keys down by `dropCount` (a turn-count drop from
	 * appendToConversation), discarding any entry whose turn no longer
	 * exists. Keeps announcementsByIndex aligned with `messages` once a
	 * conversation passes MAX_TURNS_PER_CONVERSATION. */
	function shiftAnnouncementsByIndex(
		map: Record<number, PageAnnouncement[]>,
		dropCount: number
	): Record<number, PageAnnouncement[]> {
		if (dropCount <= 0) return map;
		const next: Record<number, PageAnnouncement[]> = {};
		for (const [key, value] of Object.entries(map)) {
			const newIndex = Number(key) - dropCount;
			if (newIndex >= 0) next[newIndex] = value;
		}
		return next;
	}

	function persistTurn(turn: KuromiTurn): void {
		const now = ctx.steward.nowISO();
		const list = ctx.state.conversations;
		let id = activeConversationId;
		let conv = id ? list.find((c) => c.id === id) : undefined;
		const isNewConversation = !conv;
		if (!conv) {
			id = ctx.steward.newId();
			conv = newConversation(now, id);
		}
		const turnsBeforeCount = conv.turns.length;
		conv = appendToConversation(conv, turn, now);
		const droppedCount = turnsBeforeCount + 1 - conv.turns.length;
		if (droppedCount > 0) {
			announcementsByIndex = shiftAnnouncementsByIndex(announcementsByIndex, droppedCount);
		}
		if (isNewConversation && turn.role === 'user') {
			conv = { ...conv, title: deriveTitle(turn.content) };
		}
		const capped = capConversations(upsertConversation(list, conv));
		ctx.state.conversations = capped;
		loadedConversationKey = `${ctx.activeProfile}:${id}`;
		activeConversationId = id;
		const stored = capped.find((c) => c.id === id);
		messages = stored ? stored.turns : conv.turns;
	}

	/** Append one assistant turn and chime exactly once for that rendered reply. */
	function appendAssistantTurn(content: string, announcements: PageAnnouncement[] = []) {
		persistTurn({ role: 'assistant', content });
		if (announcements.length > 0) {
			announcementsByIndex = { ...announcementsByIndex, [messages.length - 1]: announcements };
		}
		playSfx('chat_message_in');
	}

	function resolveCreatePageId(call: KuromiToolCall, adjustmentPayload: unknown): KuromiToolCall {
		if (call.name !== 'create_page') return call;
		const pageId =
			adjustmentPayload !== null &&
			typeof adjustmentPayload === 'object' &&
			typeof (adjustmentPayload as { pageId?: unknown }).pageId === 'string'
				? (adjustmentPayload as { pageId: string }).pageId
				: undefined;
		if (!pageId) return call;
		return { ...call, arguments: JSON.stringify({ id: pageId }) };
	}

	function buildAnnouncements(
		pendingToolCalls: KuromiToolCall[],
		results: StewardToolResult[]
	): PageAnnouncement[] {
		const newAdjustments = ctx.state.adjustments.slice(-pendingToolCalls.length);
		const out: PageAnnouncement[] = [];
		for (let i = 0; i < pendingToolCalls.length; i++) {
			const call = resolveCreatePageId(pendingToolCalls[i], newAdjustments[i]?.payload);
			const ann = buildPageAnnouncement(results[i], call, ctx.state.pages);
			if (ann) out.push(ann);
		}
		return out;
	}

	/**
	 * Shared post-leg-1 settle path for sendMessage and retryLast.
	 * Ordinary reply (no toolCalls): unchanged one-bubble append.
	 * With toolCalls: executeIntents → optional leg 2 → undo toasts + exactly one assistant turn.
	 */
	async function settleAfterLeg1(
		result: KuromiClientResult,
		leg1Messages: KuromiTurn[],
		context: KuromiContextPacket
	): Promise<void> {
		if (!result.ok) {
			errorCode = result.code;
			return;
		}

		const toolCalls = result.toolCalls;
		if (!toolCalls || toolCalls.length === 0) {
			appendAssistantTurn(result.reply);
			errorCode = null;
			return;
		}

		const { results, undos, pendingToolCalls } = executeIntents(toolCalls, ctx.steward);
		const drillPath = takePendingDrill();
		if (drillPath) void goto(drillPath);
		const announcements = buildAnnouncements(pendingToolCalls, results);

		if (pendingToolCalls.length === 0) {
			// RULE 3: do not call sendKuromiToolResults (server 400s on empty pending).
			// undos is empty by construction when pendingToolCalls is empty (executor lockstep).
			// Never echo leg-1 text here — it often claims success for a dropped
			// invented tool (show_stickers / remove_missions / …).
			const content = chooseReplyWhenPendingEmpty(result.reply, FALLBACK_NOTHING_CHANGED);
			appendAssistantTurn(content, announcements);
			errorCode = null;
			return;
		}

		// RULE 1: pendingToolCalls must be the executor's array verbatim.
		// RULE 5: never execute / loop on any toolCalls that leg 2 might return.
		let assistantContent = FALLBACK_CHANGED_NO_NARRATION;
		try {
			const leg2 = await sendKuromiToolResults(ctx.activeProfile, {
				messages: leg1Messages,
				context,
				pendingToolCalls,
				toolResults: results
			});
			if (leg2.ok && leg2.reply.trim() !== '') {
				assistantContent = leg2.reply;
			}
			// RULE 4: ok: false → keep FALLBACK_CHANGED_NO_NARRATION (something changed).
		} catch {
			// Unexpected throw after mutation — still announce that something changed.
		}

		// Raise undo toasts only once leg 2 has settled (ok / not-ok / throw), so the
		// affordance is still live when the announcement bubble renders.
		for (const undo of undos) {
			addToast(undo.label, 'var(--color-lavender-deep)', {
				label: 'Undo',
				run: undo.run
			});
		}

		appendAssistantTurn(assistantContent, announcements);
		errorCode = null;
	}

	async function sendMessage() {
		const text = draft.trim();
		if (!text || sending) return;

		draft = '';
		errorCode = null;

		const userTurn: KuromiTurn = { role: 'user', content: text };
		persistTurn(userTurn);
		playSfx('sticker_send');
		sending = true;
		await tick();
		scrollToBottom();

		try {
			const leg1Messages = capHistory(messages);
			const context = await buildTurnContext();
			const result = await requestReply(leg1Messages, context);
			await settleAfterLeg1(result, leg1Messages, context);
		} catch {
			errorCode = 'network';
		} finally {
			sending = false;
		}
		await tick();
		scrollToBottom();
		inputEl?.focus();
	}

	async function retryLast() {
		if (sending || messages.length === 0) return;
		// Resend with the same stored transcript (last user message already present)
		errorCode = null;
		sending = true;
		await tick();
		scrollToBottom();

		try {
			const leg1Messages = capHistory(messages);
			const context = await buildTurnContext();
			const result = await requestReply(leg1Messages, context);
			await settleAfterLeg1(result, leg1Messages, context);
		} catch {
			errorCode = 'network';
		} finally {
			sending = false;
		}
		await tick();
		scrollToBottom();
	}

	function closeHistoryOverlay() {
		showHistoryOverlay = false;
		void tick().then(() => {
			historyBtnEl?.focus();
		});
	}

	function handleHistoryOverlayKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			closeHistoryOverlay();
			return;
		}

		if (e.key !== 'Tab') return;

		const selector =
			'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
		const list = historyDialogEl
			? Array.from(historyDialogEl.querySelectorAll<HTMLElement>(selector)).filter(
					(el) => el.offsetParent !== null
				)
			: [];

		if (list.length === 0) {
			e.preventDefault();
			historyDialogEl?.focus();
			return;
		}

		const active = document.activeElement;
		const activeIndex = active instanceof HTMLElement ? list.indexOf(active) : -1;
		e.preventDefault();
		if (e.shiftKey) {
			const previousIndex = activeIndex <= 0 ? list.length - 1 : activeIndex - 1;
			list[previousIndex].focus();
		} else {
			const nextIndex = activeIndex === -1 || activeIndex === list.length - 1 ? 0 : activeIndex + 1;
			list[nextIndex].focus();
		}
	}

	function selectConversation(id: string) {
		activeConversationId = id;
		closeHistoryOverlay();
		void tick().then(scrollToBottom);
	}

	function startNewConversation() {
		activeConversationId = null;
		closeHistoryOverlay();
	}

	function historyPortal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	function onComposerKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			void sendMessage();
		}
	}

	// Pointer drag on the grab handle
	function onHandlePointerDown(e: PointerEvent) {
		if (!isSheet) return;
		dragging = true;
		dragStartY = e.clientY;
		dragY = 0;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onHandlePointerMove(e: PointerEvent) {
		if (!dragging) return;
		const delta = e.clientY - dragStartY;
		dragY = Math.max(0, delta);
	}

	function onHandlePointerUp() {
		if (!dragging) return;
		dragging = false;
		if (dragY > 80) {
			dragY = 0;
			close();
		} else {
			dragY = 0;
		}
	}
</script>

{#snippet shellBody()}
	{#if isSheet}
		<div
			class="grab-handle-wrap"
			onpointerdown={onHandlePointerDown}
			onpointermove={onHandlePointerMove}
			onpointerup={onHandlePointerUp}
			onpointercancel={onHandlePointerUp}
		>
			<div class="grab-handle" aria-hidden="true"></div>
		</div>
	{/if}

	<header class="sheet-header">
		<h2 class="sheet-title">Kuromi</h2>
		<div class="header-actions">
			{#if isSheet}
				<button
					bind:this={historyBtnEl}
					type="button"
					class="history-btn"
					aria-label="Conversation history"
					onclick={() => (showHistoryOverlay = true)}
				>
					<History size={18} />
				</button>
			{/if}
			{#if isSheet}
				<a class="open-hub-btn" href={resolve('/kuromi')} aria-label="Open full Kuromi page">
					<Maximize2 size={18} />
				</a>
			{/if}
			<button
				bind:this={closeBtnEl}
				type="button"
				class="close-btn"
				aria-label="Close chat"
				onclick={close}
			>
				<X size={20} />
			</button>
		</div>
	</header>

	<div class="transcript" bind:this={transcriptEl}>
		{#if messages.length === 0 && !sending && !errorCode}
			<p class="empty-hint">Say something. She's listening — sort of.</p>
		{/if}

		<!-- Prefer Bubble primitive: role classes override fill/border via scoped :global under .transcript -->
		{#each messages as msg, i (i + ':' + msg.role + ':' + msg.content.slice(0, 24))}
			<div class="row" class:user={msg.role === 'user'} class:assistant={msg.role === 'assistant'}>
				{#if msg.role === 'assistant'}
					{@const parsed = parseReply(msg.content)}
					<Character who="kuromi" mood={parsed.mood} size={44} animated alt="" />
					<Bubble side="left" class="kuromi-bubble bubble-k pop-in">
						<!-- renderInline() HTML-escapes its input before injecting markup -- safe. -->
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html renderInline(parsed.text)}
						{#if parsed.question}
							<InlineQuestion question={parsed.question} />
						{/if}
						{#if parsed.sticker}
							<Character
								who={parsed.sticker.who}
								mood={parsed.sticker.mood}
								size={96}
								animated
								alt=""
							/>
						{/if}
						{#each announcementsByIndex[i] ?? [] as ann (ann.href)}
							<a class="page-announce-link" href={resolvePath(ann.href)}>{ann.text}</a>
						{/each}
					</Bubble>
				{:else}
					{@const reactMood = reactByUserIndex[i]}
					<div class="domi-bubble-wrap">
						<!-- renderInline() HTML-escapes its input before injecting markup -- safe. -->
						<!-- eslint-disable svelte/no-at-html-tags -->
						<Bubble side="right" class="domi-bubble bubble-d pop-in"
							>{@html renderInline(msg.content)}</Bubble
						>
						<!-- eslint-enable svelte/no-at-html-tags -->
						{#if reactMood}
							<span
								class="react-badge {reactJitClass(reactMood.who + '/' + reactMood.mood)}"
								aria-hidden="true"
							>
								<Character who={reactMood.who} mood={reactMood.mood} size={24} animated alt="" />
							</span>
						{/if}
					</div>
					<img
						src={PROFILES[ctx.activeProfile].avatar}
						width="44"
						height="44"
						alt=""
						aria-hidden="true"
						draggable="false"
						class="domi-avatar"
					/>
				{/if}
			</div>
		{/each}

		{#if sending}
			<div class="row assistant typing-row" aria-live="polite" aria-label="Kuromi is typing">
				<div class="typing-bubble" aria-hidden="true">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
				</div>
			</div>
		{/if}

		{#if errorCode && !sending}
			<div class="row assistant">
				<Bubble side="left" class="kuromi-bubble bubble-k pop-in">{sulkMessage(errorCode)}</Bubble>
			</div>
			<div class="retry-row">
				<button type="button" class="retry-btn" onclick={() => void retryLast()}> Retry </button>
			</div>
		{/if}
	</div>

	<div class="composer">
		<textarea
			bind:this={inputEl}
			bind:value={draft}
			class="composer-input"
			rows="1"
			placeholder="Message Kuromi…"
			aria-label="Message Kuromi"
			disabled={sending}
			onkeydown={onComposerKeydown}
		></textarea>
		<button
			type="button"
			class="send-btn"
			disabled={sending || !draft.trim()}
			onclick={() => void sendMessage()}
		>
			Send
		</button>
	</div>
{/snippet}

{#if open}
	{#if isSheet}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="kuromi-backdrop" onclick={handleBackdrop} onkeydown={handleKeydown}></div>
		<div
			bind:this={dialogEl}
			class="kuromi-shell sheet"
			role="dialog"
			aria-modal="true"
			aria-label="Chat with Kuromi"
			tabindex="-1"
			style:transform={dragY > 0 ? `translateY(${dragY}px)` : undefined}
			transition:fly={{
				x: isDesktopPanel ? 400 : 0,
				y: isDesktopPanel ? 0 : 400,
				duration: prefersReducedMotionUI ? 0 : 220,
				easing: cubicOut
			}}
			onkeydown={handleKeydown}
		>
			{@render shellBody()}
		</div>
	{:else}
		<div
			bind:this={dialogEl}
			class="kuromi-shell inline"
			role="dialog"
			aria-modal="true"
			aria-label="Chat with Kuromi"
			tabindex="-1"
			onkeydown={handleKeydown}
		>
			{@render shellBody()}
		</div>
	{/if}
{/if}

{#if showHistoryOverlay}
	<div use:historyPortal class="history-overlay-portal">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- Mouse-only convenience dismiss; the keyboard equivalent is Escape
		     on historyDialogEl (handleHistoryOverlayKeydown), which is focused
		     whenever this overlay is open. This backdrop is never focusable
		     and never needs its own key handler. -->
		<div
			class="history-overlay-backdrop"
			onclick={(e) => {
				if (e.target === e.currentTarget) closeHistoryOverlay();
			}}
		></div>
		<div
			bind:this={historyDialogEl}
			class="history-overlay-dialog"
			role="dialog"
			aria-modal="true"
			aria-label="Conversation history"
			tabindex="-1"
			onkeydown={handleHistoryOverlayKeydown}
		>
			<header class="history-overlay-header">
				<h2 class="history-overlay-title">Conversations</h2>
				<button
					type="button"
					class="history-overlay-close"
					aria-label="Close conversation history"
					onclick={closeHistoryOverlay}
				>
					<X size={18} />
				</button>
			</header>
			<ConversationList
				activeId={activeConversationId}
				onSelect={selectConversation}
				onNew={startNewConversation}
			/>
		</div>
	</div>
{/if}

<style>
	.kuromi-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-kuromi) 45%, transparent);
		z-index: 250;
	}

	.kuromi-shell {
		display: flex;
		flex-direction: column;
		background: var(--color-s1);
		z-index: 260;
		color: var(--color-text);
		/* tabindex="-1" makes this the a11y focus target on open; it is never
		   tab-reachable, so suppress the default focus ring the one time it's
		   focused programmatically. */
		outline: none;
	}

	.kuromi-shell.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 85vh;
		max-height: 85vh;
		border-top: 3px solid var(--color-kuromi);
		border-radius: 22px 22px 0 0;
		box-shadow: var(--card-shadow);
		transition: transform 0.15s ease;
		touch-action: none;
	}

	@media (min-width: 768px) {
		.kuromi-shell.sheet {
			width: 440px;
			top: 0;
			bottom: 0;
			height: 100vh;
			max-height: 100vh;
			right: 0;
			left: auto;
			border-top: none;
			border-left: 3px solid var(--color-ink);
			border-radius: 0;
		}

		.grab-handle-wrap {
			display: none;
		}
	}

	.kuromi-shell.inline {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 60vh;
		border: 3px solid var(--color-kuromi);
		border-radius: 18px;
		box-shadow: var(--card-shadow);
	}

	.grab-handle-wrap {
		display: flex;
		justify-content: center;
		padding: 10px 0 4px;
		cursor: grab;
		touch-action: none;
		flex-shrink: 0;
	}

	.grab-handle-wrap:active {
		cursor: grabbing;
	}

	.grab-handle {
		width: 40px;
		height: 5px;
		border-radius: 999px;
		background: var(--color-line);
		border: 1px solid var(--color-kuromi);
	}

	.sheet-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 16px 10px;
		flex-shrink: 0;
		border-bottom: 2px solid var(--color-line);
	}

	.sheet-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--color-kuromi);
		margin: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.history-btn,
	.open-hub-btn,
	.close-btn {
		background: none;
		border: 2px solid transparent;
		border-radius: 50%;
		color: var(--color-kuromi-mid);
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		-webkit-tap-highlight-color: transparent;
		transition: transform var(--press-duration) ease;
	}

	.open-hub-btn {
		text-decoration: none;
	}

	.history-btn:hover,
	.open-hub-btn:hover,
	.close-btn:hover {
		color: var(--color-kuromi);
		border-color: var(--color-kuromi);
		background: var(--color-blush);
	}

	.history-btn:active,
	.open-hub-btn:active,
	.close-btn:active {
		transform: scale(var(--press-scale));
	}

	.history-overlay-portal {
		position: fixed;
		inset: 0;
		z-index: 280;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		pointer-events: none;
	}

	.history-overlay-backdrop {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--color-kuromi) 45%, transparent);
		pointer-events: auto;
	}

	.history-overlay-dialog {
		position: relative;
		z-index: 1;
		pointer-events: auto;
		width: min(100%, 440px);
		max-height: min(70vh, 560px);
		margin: 0 12px calc(12px + env(safe-area-inset-bottom, 0px));
		padding: 14px 14px 16px;
		overflow: auto;
		background: var(--color-s1);
		border: 3px solid var(--color-kuromi);
		border-radius: 18px;
		box-shadow: var(--card-shadow);
		outline: none;
	}

	.history-overlay-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 12px;
	}

	.history-overlay-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--color-kuromi);
		margin: 0;
	}

	.history-overlay-close {
		background: none;
		border: 2px solid transparent;
		border-radius: 50%;
		color: var(--color-kuromi-mid);
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		-webkit-tap-highlight-color: transparent;
		transition: transform var(--press-duration) ease;
	}

	.history-overlay-close:hover {
		color: var(--color-kuromi);
		border-color: var(--color-kuromi);
		background: var(--color-blush);
	}

	.history-overlay-close:active {
		transform: scale(var(--press-scale));
	}

	.transcript {
		flex: 1;
		overflow-y: auto;
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-height: 0;
		touch-action: pan-y;
	}

	.empty-hint {
		font-size: var(--text-small);
		color: var(--color-kuromi-mid);
		text-align: center;
		margin: 12px 0;
		line-height: 1.4;
	}

	.row {
		display: flex;
		width: 100%;
		max-width: 640px;
		margin-inline: auto;
	}

	.row.user {
		justify-content: flex-end;
		align-items: flex-start;
		gap: 8px;
	}

	.row.assistant {
		justify-content: flex-start;
		align-items: flex-start;
		gap: 8px;
	}

	.domi-avatar {
		border-radius: 50%;
		flex-shrink: 0;
		object-fit: cover;
	}

	.domi-bubble-wrap {
		position: relative;
		min-width: 0;
	}

	.react-badge {
		position: absolute;
		top: -10px;
		right: -8px;
		line-height: 0;
		pointer-events: none;
		z-index: 1;
	}

	/* Bubble is a child component — pierce scope for role color overrides only */
	.transcript :global(.kuromi-bubble) {
		background: color-mix(in srgb, var(--color-lavender) 26%, white);
		border: 2px solid var(--color-ink);
		border-radius: 18px 18px 18px 5px;
		color: var(--color-text);
		font-size: var(--text-small);
		overflow-wrap: anywhere;
	}

	.page-announce-link {
		display: block;
		margin-top: 8px;
		font-family: var(--font-sans);
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-kuromi);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.transcript :global(.domi-bubble) {
		background: color-mix(in srgb, var(--color-peach) 26%, white);
		border: 2px solid var(--color-ink);
		border-radius: 18px 18px 5px 18px;
		color: var(--color-text);
		font-size: var(--text-small);
		overflow-wrap: anywhere;
	}

	/* Typing indicator: same outer spacing as a real bubble row to avoid layout shift */
	.typing-row {
		min-height: 48px;
	}

	.typing-bubble {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 14px 16px;
		background: var(--color-lilac);
		border: 2px solid var(--color-kuromi);
		border-radius: 18px 18px 18px 6px;
		min-width: 56px;
		min-height: 20px;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-kuromi-mid);
		animation: bounce 1s ease-in-out infinite;
	}

	.dot:nth-child(2) {
		animation-delay: 0.15s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes bounce {
		0%,
		60%,
		100% {
			transform: translateY(0);
			opacity: 0.5;
		}
		30% {
			transform: translateY(-4px);
			opacity: 1;
		}
	}

	.retry-row {
		display: flex;
		justify-content: flex-start;
		padding-left: 2px;
	}

	.retry-btn {
		padding: 8px 16px;
		border-radius: 999px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		background: var(--color-rose);
		border: 2px solid var(--color-kuromi);
		color: var(--color-kuromi);
		box-shadow: var(--sticker-shadow);
		transition: transform var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
	}

	.retry-btn:active {
		transform: scale(var(--press-scale));
	}

	.composer {
		display: flex;
		gap: 8px;
		align-items: flex-end;
		padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
		border-top: 2px solid var(--color-line);
		flex-shrink: 0;
		background: var(--color-s1);
	}

	.composer-input {
		flex: 1;
		resize: none;
		min-height: 42px;
		max-height: 120px;
		padding: 10px 14px;
		border-radius: 14px;
		border: 2px solid var(--color-kuromi);
		background: var(--color-blush);
		color: var(--color-text);
		font-family: var(--font-sans);
		font-size: var(--text-small);
		line-height: 1.4;
		outline: none;
	}

	.composer-input:focus {
		border-color: var(--color-kuromi-mid);
	}

	.composer-input:disabled {
		opacity: 0.7;
	}

	.send-btn {
		padding: 10px 16px;
		border-radius: 999px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		background: var(--color-lilac);
		border: 2px solid var(--color-kuromi);
		color: var(--color-kuromi);
		box-shadow: var(--sticker-shadow);
		transition: transform var(--press-duration) ease;
		-webkit-tap-highlight-color: transparent;
		flex-shrink: 0;
	}

	.send-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		box-shadow: none;
	}

	.send-btn:not(:disabled):active {
		transform: scale(var(--press-scale));
	}
</style>
