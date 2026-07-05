<script>
	/**
	 * PauseBeat — a full-width resting moment: one large statement and one
	 * "Continue" button (smooth-scrolls past the beat), plus an optional
	 * "Explore this" enrichment accordion. At most TWO in the whole piece.
	 *
	 * The statement is part of the scroll narrative and always renders;
	 * only the buttons are affordances, so only they disappear under
	 * ?notap=1 — a scroll-only reader simply keeps scrolling.
	 */
	import { dismissable } from './dismiss.js';
	import { ui } from '$lib/state.svelte.js';

	let {
		id,
		kicker = '',
		statement,
		surface = 'dark',
		exploreLabel = '',
		children = null
	} = $props();

	let el = $state(null);
	let exploreOpen = $state(false);
	let exploreBtn = $state(null);

	function onContinue() {
		// user-initiated, so smooth scroll is fine — but never under
		// prefers-reduced-motion
		el?.nextElementSibling?.scrollIntoView({
			behavior: ui.reducedMotion ? 'auto' : 'smooth',
			block: 'start'
		});
	}

	function dismissExplore() {
		exploreOpen = false;
		exploreBtn?.focus();
	}
</script>

<section bind:this={el} class="pause surface-{surface} no-print" aria-label={statement}>
	<div class="pause-inner">
		{#if kicker}
			<p class="kicker">{kicker}</p>
		{/if}
		<p class="statement display">{statement}</p>

		{#if !ui.noTap}
			<div class="row" use:dismissable={{ active: exploreOpen, onDismiss: dismissExplore }}>
				<button class="beat-pill" class:beat-idle-pulse={!exploreOpen} onclick={onContinue}>
					Continue ↓
				</button>
				{#if children && exploreLabel}
					<button
						bind:this={exploreBtn}
						class="beat-pill secondary"
						aria-expanded={exploreOpen}
						aria-controls="{id}-explore"
						onclick={() => (exploreOpen = !exploreOpen)}
					>
						{exploreLabel}
					</button>
				{/if}
			</div>
			{#if children && exploreLabel}
				<div class="accordion" class:open={exploreOpen}>
					<div class="inner">
						<div class="beat-card" id="{id}-explore" role="region" aria-label={exploreLabel}>
							{@render children()}
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</section>

<style>
	.pause {
		min-height: 78vh;
		display: grid;
		place-items: center;
		padding: 4rem 1.5rem;
	}

	.pause-inner {
		max-width: 40rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.statement {
		font-size: clamp(1.7rem, 5.5vw, 3rem);
		font-weight: 900;
		line-height: 1.15;
		margin: 0;
		text-wrap: balance;
	}

	.row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 0.75rem;
	}

	.secondary {
		border-style: dashed;
	}

	.accordion {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.4s ease;
		width: 100%;
	}

	.accordion.open {
		grid-template-rows: 1fr;
	}

	.inner {
		overflow: hidden;
	}

	.inner > :global(.beat-card) {
		margin-top: 0.75rem;
		text-align: left;
	}

	@media (prefers-reduced-motion: reduce) {
		.accordion {
			transition: none;
		}
	}
</style>
