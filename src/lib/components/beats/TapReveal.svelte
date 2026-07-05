<script>
	/**
	 * TapReveal — a pill button inline in the narrative column that expands
	 * a card in place (accordion; no navigation, no modal). Optional
	 * enrichment only: the scroll-only story is complete without it, and it
	 * renders nothing under ?notap=1. Use sparingly — max one per scene.
	 */
	import { dismissable } from './dismiss.js';
	import { ui } from '$lib/state.svelte.js';

	let { id, label, children } = $props();

	let open = $state(false);
	let button = $state(null);

	function dismiss() {
		open = false;
		button?.focus();
	}
</script>

{#if !ui.noTap}
	<div class="tap-reveal no-print" use:dismissable={{ active: open, onDismiss: dismiss }}>
		<button
			bind:this={button}
			class="beat-pill"
			class:beat-idle-pulse={!open}
			aria-expanded={open}
			aria-controls="{id}-card"
			onclick={() => (open = !open)}
		>
			{label}
			<span class="chev" aria-hidden="true">{open ? '↑' : '→'}</span>
		</button>
		<div class="accordion" class:open id="{id}-card" role="region" aria-label={label}>
			<div class="inner">
				<div class="beat-card">
					{@render children()}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.tap-reveal {
		margin: 0.75rem 0;
	}

	.chev {
		opacity: 0.7;
	}

	/* accordion via the 0fr → 1fr grid-row trick: animates to content height */
	.accordion {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.4s ease;
	}

	.accordion.open {
		grid-template-rows: 1fr;
	}

	.inner {
		overflow: hidden;
	}

	.inner > :global(.beat-card) {
		margin-top: 0.6rem;
		max-width: 36rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.accordion {
			transition: none;
		}
	}
</style>
