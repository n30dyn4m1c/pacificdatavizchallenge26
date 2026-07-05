<script>
	/**
	 * LagTicker — the persistent "T + n months since the ocean signal"
	 * clock. It starts inside scene 4 (once the signal crosses +0.5) and
	 * PERSISTS through scenes 5 and 6, quietly incrementing as the reader
	 * scrolls — the reader carries the clock with them. It dismisses itself
	 * when scene 7 begins: the calendar takes over as the time object.
	 *
	 * Purely presentational (the same numbers live in scene 4's data table
	 * and prose), so it is aria-hidden and unaffected by ?notap=1.
	 */
	import { lag } from '$lib/state.svelte.js';

	const months = $derived(
		lag.baseMonths >= 0 ? lag.baseMonths + lag.extra5 + lag.extra6 : -1
	);
	const shown = $derived(!lag.dismissed && months >= 0);
</script>

<div class="lag-ticker no-print" class:shown aria-hidden="true">
	<span class="ticker-n">T + {Math.max(0, months)}</span>
	<span class="ticker-label">months since the ocean signal</span>
</div>

<style>
	.lag-ticker {
		position: fixed;
		bottom: 1.1rem;
		left: 1.25rem;
		z-index: 40;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.5rem 0.85rem;
		border: 1px solid var(--ink-dark-axis);
		border-radius: 999px;
		background: color-mix(in srgb, var(--ocean) 78%, transparent);
		backdrop-filter: blur(4px);
		opacity: 0;
		transform: translateY(8px);
		transition: opacity 0.45s, transform 0.45s;
		pointer-events: none;
	}

	.lag-ticker.shown {
		opacity: 1;
		transform: none;
	}

	.ticker-n {
		font-family: Fraunces, Georgia, serif;
		font-weight: 900;
		font-size: 1.15rem;
		font-variant-numeric: tabular-nums;
		color: var(--accent-dark);
	}

	.ticker-label {
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-dark-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.lag-ticker {
			transform: none;
			transition: opacity 0.45s;
		}
	}
</style>
