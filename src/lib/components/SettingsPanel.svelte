<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { PROFILES, setActiveProfile, type ProfileId } from '$lib/profiles/profiles';
	import { playSfx } from '$lib/sound/sfx';
	import Icon from '$lib/icons/Icon.svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import SyncPanel from '$lib/components/sync/SyncPanel.svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
	}
	let { open, onclose }: Props = $props();

	const ctx = getGameContext();

	let keyValue = $state('');
	let advancedOpen = $state(false);

	$effect(() => {
		if (open) {
			keyValue = ctx.state.tts.googleApiKey ?? '';
			// Auto-expand if the TTS key is already configured so the user can edit
			advancedOpen = !!keyValue;
		}
	});

	function save() {
		const trimmedTts = keyValue.trim();
		ctx.state.tts.googleApiKey = trimmedTts || null;

		onclose();
	}

	function clear() {
		ctx.state.tts.googleApiKey = null;
		keyValue = '';
		onclose();
	}

	function switchProfile(id: ProfileId) {
		if (id === ctx.activeProfile) return;
		setActiveProfile(id);
		// Full page reload to reinitialize with new profile
		window.location.reload();
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
		}
	}

	// Portal to document.body so the panel stacks above app chrome
	// (stacking-context bug elsewhere would cover an in-place fixed overlay).
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	const SYNC_STATUS_LABELS: Record<string, string> = {
		online: 'Connected',
		offline: 'Offline',
		disabled: 'Not configured'
	};

	const SYNC_STATUS_COLORS: Record<string, string> = {
		online: 'var(--color-teal-deep)',
		offline: 'var(--color-rose-deep)',
		disabled: 'var(--color-muted-ink)'
	};
</script>

{#if open}
	<div use:portal class="settings-portal">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="settings-backdrop" onclick={handleBackdrop} onkeydown={handleKeydown}>
			<div
				class="settings-panel r-card edge-ink offset-card--soft"
				role="dialog"
				aria-modal="true"
				aria-labelledby="settings-title"
			>
				<div class="sparkle">
					<Doodle name="spark-sparkle-26" size={28} color="var(--color-rose-deep)" tilt={-6} />
				</div>

				<div class="settings-header">
					<div class="title-block">
						<h2 id="settings-title" class="settings-title">Settings</h2>
						<div class="title-swirl">
							<Doodle
								name="shape-swirl-loops-4"
								size={54}
								color="var(--color-rose-deep)"
								tilt={-2}
							/>
						</div>
					</div>
					<button class="settings-close tappable" onclick={onclose} aria-label="Close settings">
						<Icon name="xmark" size={20} color="var(--color-ink)" />
					</button>
				</div>

				<section class="settings-section section-profile">
					<h3 class="section-label jit-a">Profile</h3>
					<div class="profile-switcher">
						{#each Object.values(PROFILES) as profile (profile.id)}
							<button
								class="profile-option tappable"
								class:active={ctx.activeProfile === profile.id}
								onclick={() => switchProfile(profile.id)}
							>
								<img src={profile.avatar} alt={profile.name} class="profile-img" />
								<span class="profile-name">{profile.name}</span>
							</button>
						{/each}
					</div>
				</section>

				<section class="settings-section section-sync">
					<h3 class="section-label jit-b">Sync</h3>
					<div class="sync-status r-pill offset-pill">
						<span class="sync-dot" style="background: {SYNC_STATUS_COLORS[ctx.syncStatus]}"></span>
						<span class="sync-text">{SYNC_STATUS_LABELS[ctx.syncStatus]}</span>
					</div>
				</section>

				<SyncPanel />

				<section class="settings-section section-advanced">
					<button
						class="advanced-toggle tappable"
						onclick={() => (advancedOpen = !advancedOpen)}
						aria-expanded={advancedOpen}
					>
						<span class="section-label jit-3">Advanced</span>
						<Icon
							name="chevron-down"
							size={16}
							color="var(--color-ink)"
							class={advancedOpen ? 'chevron chevron-open' : 'chevron'}
						/>
					</button>

					{#if advancedOpen}
						<div class="field">
							<label class="field-label" for="tts-key">Natural voice (optional)</label>
							<input
								id="tts-key"
								type="password"
								class="field-input"
								bind:value={keyValue}
								placeholder="Google TTS API key"
								autocomplete="off"
							/>
							<p class="field-hint">
								Adds a higher-quality Dutch voice. Browser voice is used otherwise.
							</p>
						</div>
					{/if}
				</section>

				<section class="settings-section section-danger">
					<h3 class="section-label danger-label jit-c">Danger Zone</h3>
					<button class="btn-danger tappable" onclick={() => ctx.resetProgress()}>
						<Icon name="trash-can" size={14} color="var(--color-rose-ink)" />
						Reset All Progress
					</button>
					<p class="field-hint">
						Wipes everything: LP, rank, cards, missions, achievements. This cannot be undone.
					</p>
				</section>

				<div class="actions">
					<button class="btn-secondary tappable" onclick={clear}>Clear TTS Key</button>
					<button
						class="btn-primary tappable"
						onclick={() => {
							playSfx('button_tap');
							save();
						}}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.settings-portal {
		display: contents;
	}

	.settings-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--color-ink) 45%, transparent);
		z-index: 300;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.settings-panel {
		background: #ffffff;
		max-width: 420px;
		width: 100%;
		max-height: 88vh;
		overflow-y: auto;
		padding: 22px 20px 20px;
		position: relative;
	}

	.sparkle {
		position: absolute;
		top: -8px;
		right: 10px;
		pointer-events: none;
		line-height: 0;
		z-index: 1;
	}

	.settings-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 16px;
		gap: 12px;
	}

	.title-block {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-width: 0;
	}

	.settings-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-title);
		color: var(--color-ink);
		letter-spacing: -0.02em;
		margin: 0;
	}

	.title-swirl {
		line-height: 0;
		margin-top: 2px;
		pointer-events: none;
	}

	.settings-close {
		background: none;
		border: none;
		border-radius: 999px;
		padding: 6px;
		cursor: pointer;
		display: flex;
		-webkit-tap-highlight-color: transparent;
		flex-shrink: 0;
	}

	.settings-section {
		border-radius: 16px;
		padding: 14px 16px;
		margin-bottom: 14px;
	}

	.section-profile {
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-lavender) 55%, white),
			color-mix(in srgb, var(--color-lavender) 26%, white)
		);
	}

	.section-sync {
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-teal) 55%, white),
			color-mix(in srgb, var(--color-teal) 26%, white)
		);
	}

	.section-advanced {
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-peach) 55%, white),
			color-mix(in srgb, var(--color-peach) 26%, white)
		);
	}

	.section-danger {
		margin-bottom: 0;
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--color-rose) 55%, white),
			color-mix(in srgb, var(--color-rose) 26%, white)
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
	}

	.section-profile .section-label {
		color: var(--color-lavender-deep);
	}

	.section-sync .section-label {
		color: var(--color-teal-deep);
	}

	.section-advanced .section-label {
		color: var(--color-peach-deep);
		margin-bottom: 0;
	}

	.section-danger .section-label,
	.danger-label {
		color: var(--color-rose-ink);
	}

	.profile-switcher {
		display: flex;
		gap: 10px;
	}

	.profile-option {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		background: #ffffff;
		border: 2px solid transparent;
		border-radius: 14px;
		padding: 12px 8px;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition:
			border-color 0.15s,
			background 0.15s,
			box-shadow 0.15s;
	}

	.profile-option.active {
		border-color: var(--color-rose-deep);
		box-shadow: var(--shadow-offset-pill);
		background: color-mix(in srgb, var(--color-rose) 30%, white);
	}

	.profile-img {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--color-ink);
	}

	.profile-name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		color: var(--color-muted-ink);
	}

	.profile-option.active .profile-name {
		color: var(--color-ink);
	}

	.sync-status {
		background: #ffffff;
		padding: 8px 12px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		width: fit-content;
	}

	.sync-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.sync-text {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-small);
		color: var(--color-text);
	}

	.advanced-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.advanced-toggle :global(.chevron) {
		transition: transform 0.25s ease;
		display: inline-flex;
	}

	.advanced-toggle :global(.chevron-open) {
		transform: rotate(180deg);
	}

	.field {
		margin-top: 12px;
	}

	.field-label {
		display: block;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-peach-deep);
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

	.btn-danger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 18px;
		border-radius: 999px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		background: color-mix(in srgb, var(--color-rose) 35%, white);
		border: 2px solid var(--color-rose-deep);
		color: var(--color-rose-ink);
		box-shadow: var(--shadow-offset-pill);
		-webkit-tap-highlight-color: transparent;
	}

	.actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		margin-top: 4px;
	}

	.btn-primary {
		background: var(--color-ink);
		border: 2px solid var(--color-ink);
		color: var(--color-cream);
		border-radius: 999px;
		padding: 10px 20px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		box-shadow: var(--shadow-offset-pill);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-secondary {
		background: #ffffff;
		border: 2px solid var(--color-ink);
		color: var(--color-muted-ink);
		border-radius: 999px;
		padding: 10px 20px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-small);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
</style>
