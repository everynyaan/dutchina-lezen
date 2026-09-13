<script lang="ts">
	import {
		auth,
		sendMagicLink,
		signOut,
		bindSync,
		clearSyncBinding
	} from '$lib/auth/session.svelte';
	import { syncStatus, pullNow, pushNow } from '$lib/sync/engine.svelte';
	import { getSyncKey, setSyncKey, getActiveProfile } from '$lib/profiles/profiles';
	import Character from '$lib/components/art/Character.svelte';

	let email = $state('');
	let magicLinkSending = $state(false);
	let magicLinkMessage = $state<string | null>(null);
	let magicLinkError = $state<string | null>(null);

	let syncing = $state(false);

	let apiKey = $state('');

	const PHASE_LABELS: Record<string, string> = {
		disabled: 'Not syncing',
		idle: 'Up to date',
		pulling: 'Receiving…',
		pushing: 'Sending…',
		offline: 'Offline',
		error: 'Error'
	};

	$effect(() => {
		if (typeof window === 'undefined') return;
		apiKey = getSyncKey() ?? '';
	});

	const showKuromiTrouble = $derived(
		syncStatus.phase === 'offline' || Boolean(syncStatus.lastError)
	);

	function formatRelative(iso: string | null): string {
		if (!iso) return 'never';
		const then = new Date(iso).getTime();
		if (Number.isNaN(then)) return 'never';
		const diffMs = Math.max(0, Date.now() - then);
		const secs = Math.floor(diffMs / 1000);
		if (secs < 60) return 'just now';
		const mins = Math.floor(secs / 60);
		if (mins < 60) return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
		const days = Math.floor(hours / 24);
		return days === 1 ? '1 day ago' : `${days} days ago`;
	}

	async function handleMagicLink() {
		if (magicLinkSending) return;
		const trimmed = email.trim();
		if (!trimmed) return;
		magicLinkSending = true;
		magicLinkMessage = null;
		magicLinkError = null;
		try {
			const result = await sendMagicLink(trimmed);
			if (result.ok) {
				magicLinkMessage = 'Check your email for the link.';
			} else {
				magicLinkError = `Something went wrong: ${result.error ?? 'unknown error'}`;
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			magicLinkError = `Something went wrong: ${msg}`;
		} finally {
			magicLinkSending = false;
		}
	}

	function handleBind() {
		const uid = auth.userId;
		if (!uid) return;
		bindSync(getActiveProfile(), uid);
	}

	async function handleSyncNow() {
		if (syncing) return;
		syncing = true;
		try {
			await pullNow();
			await pushNow();
		} finally {
			syncing = false;
		}
	}

	function saveApiKey() {
		if (typeof window === 'undefined') return;
		setSyncKey(apiKey.trim() || null);
	}

	function handleApiKeyInput() {
		saveApiKey();
	}
</script>

<section class="settings-section section-cloud-sync">
	<h3 class="section-label jit-4">Cloud sync</h3>

	{#if syncStatus.needsUpdate}
		<div class="banner banner-warn r-pill offset-pill" role="status">
			A newer version of the app is syncing on another device. Update this device to resume syncing
			— it is paused for safety in the meantime.
		</div>
	{/if}

	{#if auth.state !== 'signed-in'}
		<p class="body-line">
			Sign in with a magic link to sync progress across devices. No password needed.
		</p>
		<div class="field">
			<label class="field-label" for="sync-magic-email">Email</label>
			<input
				id="sync-magic-email"
				type="email"
				class="field-input"
				bind:value={email}
				placeholder="you@example.com"
				autocomplete="email"
				disabled={magicLinkSending}
			/>
		</div>
		<div class="btn-row">
			<button
				type="button"
				class="btn-primary tappable"
				onclick={handleMagicLink}
				disabled={magicLinkSending || !email.trim()}
			>
				{magicLinkSending ? '…' : 'Send me a link'}
			</button>
		</div>
		{#if magicLinkMessage}
			<p class="status-ok" role="status">{magicLinkMessage}</p>
		{/if}
		{#if magicLinkError}
			<p class="status-err" role="alert">{magicLinkError}</p>
		{/if}
	{:else if auth.blockedReason === 'profile-mismatch'}
		<p class="body-line">
			This device is linked to a different profile's sync data. Switch back to that profile, or
			unlink this device below to link it to the current one instead.
		</p>
		{#if auth.email}
			<p class="meta-line">Signed in as {auth.email}</p>
		{/if}
		<div class="btn-row">
			<button type="button" class="btn-secondary tappable" onclick={() => clearSyncBinding()}>
				Unlink
			</button>
			<button type="button" class="btn-secondary tappable" onclick={() => signOut()}>
				Sign out
			</button>
		</div>
	{:else if auth.blockedReason === 'account-mismatch'}
		{#if auth.email}
			<p class="meta-line">Signed in as {auth.email}</p>
		{/if}
		<p class="body-line">Link this device to receive and send progress with this account.</p>
		<div class="btn-row">
			<button type="button" class="btn-primary tappable" onclick={handleBind}>
				Link this device
			</button>
			<button type="button" class="btn-secondary tappable" onclick={() => signOut()}>
				Sign out
			</button>
		</div>
	{:else if auth.canSync}
		<div class="status-block r-pill offset-pill">
			<div class="status-row">
				<span class="status-phase">{PHASE_LABELS[syncStatus.phase] ?? syncStatus.phase}</span>
				<span
					class="live-dot"
					class:live={syncStatus.live}
					title={syncStatus.live ? 'Realtime connected' : 'Realtime disconnected'}
				></span>
				<span class="live-label">{syncStatus.live ? 'live' : 'offline'}</span>
			</div>
			<p class="meta-line">Last synced: {formatRelative(syncStatus.lastSyncedAt)}</p>
			{#if syncStatus.pending.length > 0}
				<p class="meta-line">Pending: {syncStatus.pending.join(', ')}</p>
			{/if}
			{#if syncStatus.lastError}
				<p class="status-err" role="alert">{syncStatus.lastError}</p>
			{/if}
		</div>
		<div class="btn-row">
			<button type="button" class="btn-primary tappable" onclick={handleSyncNow} disabled={syncing}>
				{syncing ? '…' : 'Sync now'}
			</button>
			<button type="button" class="btn-secondary tappable" onclick={() => clearSyncBinding()}>
				Unlink
			</button>
			<button type="button" class="btn-secondary tappable" onclick={() => signOut()}>
				Sign out
			</button>
		</div>
	{/if}

	{#if showKuromiTrouble}
		<div class="kuromi-fail">
			<Character who="kuromi" mood="grumpy" size={48} />
			<p class="kuromi-line">Ugh. The server is ignoring me. Rude.</p>
		</div>
	{/if}

	<div class="field api-key-field">
		<label class="field-label" for="kuromi-access-key">Kuromi access key</label>
		<input
			id="kuromi-access-key"
			type="password"
			class="field-input"
			bind:value={apiKey}
			oninput={handleApiKeyInput}
			onblur={saveApiKey}
			placeholder="Paste key to enable chat & drills"
			autocomplete="off"
		/>
		<p class="field-hint">
			This key authenticates Kuromi's chat and drills to the Netlify function. It is deliberately
			not shipped in the app bundle, so she stays offline until you paste it here. It is not used
			for cloud sync — that runs on your signed-in account.
		</p>
	</div>
</section>

<style>
	.settings-section {
		border-radius: 16px;
		padding: 14px 16px;
		margin-bottom: 14px;
	}

	.section-cloud-sync {
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}

	.section-label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 8px;
		display: block;
		color: var(--color-teal-deep);
	}

	.body-line {
		font-size: var(--text-small);
		color: var(--color-text);
		line-height: 1.45;
		margin: 0 0 10px;
	}

	.meta-line {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.4;
		margin: 0 0 8px;
	}

	.banner {
		background: color-mix(in srgb, var(--color-peach) 45%, white);
		border: 2px solid var(--color-ink);
		padding: 10px 12px;
		font-size: var(--text-small);
		color: var(--color-text);
		line-height: 1.45;
		margin-bottom: 12px;
	}

	.field {
		margin-top: 10px;
	}

	.api-key-field {
		margin-top: 14px;
		padding-top: 12px;
		border-top: 1px solid color-mix(in srgb, var(--color-teal) 35%, white);
	}

	.field-label {
		display: block;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-teal-deep);
		margin-bottom: 6px;
	}

	.field-input {
		width: 100%;
		padding: 12px 14px;
		background: #ffffff;
		border: 2px solid var(--color-ink);
		border-radius: 12px;
		color: var(--color-text);
		font-family: var(--font-sans);
		font-size: var(--text-base);
		outline: none;
		transition: border-color 0.15s;
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
	}

	.field-input:focus {
		border-color: var(--color-rose-deep);
	}

	.field-input::placeholder {
		color: var(--color-muted-ink);
	}

	.field-hint {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
		line-height: 1.4;
		margin-top: 8px;
		margin-bottom: 0;
	}

	.btn-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 10px;
	}

	.btn-primary {
		background: var(--color-ink);
		border: 2px solid var(--color-ink);
		color: var(--color-cream);
		border-radius: 999px;
		padding: 10px 16px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		box-shadow: var(--shadow-offset-pill);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-primary:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: #ffffff;
		border: 2px solid var(--color-ink);
		color: var(--color-muted-ink);
		border-radius: 999px;
		padding: 10px 16px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		box-shadow: var(--shadow-offset-pill);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-secondary:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.status-block {
		background: #ffffff;
		padding: 10px 12px;
		margin-top: 4px;
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.status-phase {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		color: var(--color-ink);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.live-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--color-muted-ink);
	}

	.live-dot.live {
		background: var(--color-teal-deep);
	}

	.live-label {
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}

	.status-ok {
		font-size: var(--text-small);
		color: var(--color-teal-deep);
		line-height: 1.4;
		margin: 8px 0 0;
	}

	.status-err {
		font-size: var(--text-small);
		color: var(--color-rose-ink);
		line-height: 1.4;
		margin: 8px 0 0;
	}

	.kuromi-fail {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 12px;
		padding: 10px 12px;
		background: #ffffff;
		border: 2px solid var(--color-ink);
		border-radius: 14px;
		box-shadow: var(--shadow-offset-pill);
	}

	.kuromi-line {
		font-size: var(--text-small);
		color: var(--color-text);
		line-height: 1.4;
		margin: 0;
		font-weight: 600;
	}
</style>
