<script lang="ts">
	import { tick } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from '$lib/icons/Icon.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import { getGameContext } from '$lib/state/context';
	import WeeksetCard from './WeeksetCard.svelte';
	import MissionRows from './MissionRows.svelte';
	import StatBadges from './StatBadges.svelte';
	import CollectionShelf from './CollectionShelf.svelte';
	import AchievementGrid from '$lib/components/AchievementGrid.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		total: number;
		answered: number;
		correct: number;
		completed: boolean;
		lpEarned: number;
		isThisWeek: boolean;
	}

	let { open, onClose, total, answered, correct, completed, lpEarned, isThisWeek }: Props =
		$props();

	const ctx = getGameContext();
	let progressionDisplay = $derived(ctx.state.appConfig.progression.display);

	let dialogEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (open) {
			void tick().then(() => {
				dialogEl?.focus();
			});
		}
	});

	function close() {
		onClose();
	}

	// Re-queried on every Tab press (not cached at open time) because the
	// achievements section can expand/collapse and change what is focusable.
	function getFocusable(): HTMLElement[] {
		if (!dialogEl) return [];
		const nodes = dialogEl.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		return Array.from(nodes).filter((el) => el.offsetParent !== null);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			close();
			return;
		}
		if (e.key !== 'Tab') return;

		const focusable = getFocusable();
		if (focusable.length === 0) {
			e.preventDefault();
			dialogEl?.focus();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;
		const inList = active ? focusable.includes(active) : false;

		if (e.shiftKey) {
			if (!inList || active === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (!inList || active === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}

	// This component is rendered from a route page, which lives inside
	// <main class="content"> in +layout.svelte. That element carries
	// view-transition-name, which gives it its own stacking context, so a
	// position:fixed descendant (this sheet) would render UNDER the
	// floating tab-bar (also position:fixed, but a sibling of .content)
	// no matter how high its own z-index is set. Move the sheet to
	// <body> on mount so it stacks in the root context instead, exactly
	// like ChatSheet does by being declared outside .content already.
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}
</script>

{#if open}
	<div use:portal class="doelen-portal">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="doelen-backdrop"
			transition:fade={{ duration: 220 }}
			onclick={handleBackdrop}
			onkeydown={handleKeydown}
		></div>

		<div
			bind:this={dialogEl}
			class="doelen-sheet"
			role="dialog"
			aria-modal="true"
			aria-labelledby="doelen-title"
			tabindex="-1"
			transition:fly={{ y: 40, duration: 220, easing: cubicOut }}
			onkeydown={handleKeydown}
		>
			<header class="doelen-header">
				<h2 id="doelen-title" class="doelen-title">goals</h2>
				<button type="button" class="doelen-close" aria-label="Close goals" onclick={close}>
					<Icon name="xmark" size={20} color="var(--color-ink)" />
				</button>
			</header>

			<div class="doelen-body">
				<StatBadges />

				<div class="ws-wrap">
					<WeeksetCard
						class="ws-bordered"
						{total}
						{answered}
						{correct}
						{completed}
						{lpEarned}
						{isThisWeek}
					/>
					<span class="ws-doodle">
						<Doodle
							name="spark-sparks-sparkle-stars-30"
							size={26}
							color="var(--color-rose-deep)"
							tilt={-8}
						/>
					</span>
				</div>

				<MissionRows />

				<section class="doelen-section">
					{#if progressionDisplay === 'collection'}
						<CollectionShelf expanded={false} />
					{:else}
						<AchievementGrid expanded={false} />
					{/if}
				</section>
			</div>
		</div>
	</div>
{/if}

<style>
	.doelen-portal {
		display: contents;
	}

	.doelen-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-ink) 45%, transparent);
		z-index: 250;
	}

	.doelen-sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 260;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		background: #ffffff;
		border-top: 2px solid var(--color-ink);
		border-radius: 22px 22px 0 0;
		box-shadow: var(--shadow-offset-frame);
		outline: none;
	}

	.doelen-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		padding: 16px 18px 10px;
	}

	.doelen-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-title);
		color: var(--color-ink);
		letter-spacing: -0.02em;
		text-transform: lowercase;
		line-height: 1.1;
	}

	.doelen-close {
		background: none;
		border: none;
		border-radius: 999px;
		padding: 8px;
		display: flex;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: transform var(--press-duration) ease;
	}

	.doelen-close:active {
		transform: scale(var(--press-scale));
	}

	.doelen-body {
		overflow-y: auto;
		padding: 4px 18px calc(24px + env(safe-area-inset-bottom, 0px));
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.ws-wrap {
		position: relative;
	}

	.ws-doodle {
		position: absolute;
		top: -10px;
		right: 8px;
		pointer-events: none;
		line-height: 0;
	}

	.doelen-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	:global(.ws-bordered) {
		border: 2px solid var(--color-ink);
	}
</style>
