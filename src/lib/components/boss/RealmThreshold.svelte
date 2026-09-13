<script lang="ts">
	interface Props {
		phase: 'enter' | 'exit' | null;
	}

	let { phase }: Props = $props();

	let reducedMotion = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = () => {
			reducedMotion = mq.matches;
		};
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	// Port to document.body so the wipe sits above the shell (same pattern as DoelenSheet).
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}
</script>

{#if phase && !reducedMotion}
	<div use:portal class="realm-threshold" aria-hidden="true">
		<div class="wipe" class:enter={phase === 'enter'} class:exit={phase === 'exit'}></div>
	</div>
{/if}

<style>
	.realm-threshold {
		position: fixed;
		inset: 0;
		z-index: 500;
		pointer-events: none;
	}

	.wipe {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 300vmax;
		height: 300vmax;
		margin-left: -150vmax;
		margin-top: -150vmax;
		border-radius: 50%;
		/* Deepen: cream → plum → charcoal from rim to core */
		background: radial-gradient(
			circle,
			var(--color-realm-bg) 0%,
			var(--color-ink) 45%,
			var(--color-cream) 100%
		);
		animation-duration: 400ms;
		animation-timing-function: ease-out;
		animation-fill-mode: forwards;
		animation-iteration-count: 1;
	}

	.wipe.enter {
		animation-name: wipe-enter;
	}

	.wipe.exit {
		animation-name: wipe-exit;
	}

	@keyframes wipe-enter {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(1);
		}
	}

	@keyframes wipe-exit {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(0);
		}
	}
</style>
