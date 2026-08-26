<script>
	/**
	 * TheClock — chapter nine's exit beat: where the reader is standing
	 * inside the event. Three month-resolution counters computed from the
	 * reader's actual current month (ui.now, PNG time):
	 *
	 *   · months since Papua New Guinea declared the El Niño (1 May 2026)
	 *   · months until the analogue estimate's expected peak (Nov 2026)
	 *   · months until the estimated swing back to the rain (Jun 2027)
	 *
	 * Month resolution is deliberate — it is the resolution the record and
	 * the estimate actually support, and the counter can never claim a
	 * precision the pipeline did not compute. Before mount (prerendered
	 * HTML, no JS) the tiles read at the piece's stated as-of date,
	 * August 2026, rather than lying empty.
	 */
	import { ui } from '$lib/state.svelte.js';
	import { reveal } from '$lib/reveal.js';
	import { now } from '$lib/generated/now-copy.js';

	const DECL = { y: 2026, m: 5 }; //   NWS El Niño declaration, 1 May 2026
	const PEAK = { y: 2026, m: 11 }; //  the estimate's peak month (Nov 2026)
	const SWING = { y: 2027, m: 6 }; //  the estimated swing back (Jun 2027)
	const AS_OF = { y: 2026, m: 8 }; //  the piece's stated as-of date

	const between = (a, b) => (b.y - a.y) * 12 + (b.m - a.m);
	const MONTHS = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	let today = $derived(ui.now ?? AS_OF);
	let here = $derived(`${MONTHS[today.m - 1]} ${today.y}`);

	// ?now= dev overrides can put the reader before the declaration; a
	// negative "months since" would be nonsense, so clamp at 0 (the event
	// simply has not started for that reader)
	let dDecl = $derived(Math.max(0, between(DECL, today)));
	let dPeak = $derived(between(today, PEAK));
	let dSwing = $derived(between(today, SWING));
</script>

<section class="clock no-print" aria-label="Where you are in the event">
	<p class="kicker" use:reveal>The clock · you are here</p>
	<div class="tiles" use:reveal={{ delay: 90 }}>
		<div class="tile">
			<p class="n">{dDecl}<span class="u">&nbsp;{dDecl === 1 ? 'month' : 'months'}</span></p>
			<p class="l">since the declaration — Papua New Guinea declared this El Niño on 1 May 2026</p>
		</div>
		<div class="tile hot">
			<p class="n">
				{#if dPeak > 0}{dPeak}<span class="u">&nbsp;{dPeak === 1 ? 'month' : 'months'}</span>{:else}now{/if}
			</p>
			<p class="l">to the expected peak — {now.estimate.text} °C or more around {now.estimate.label}</p>
		</div>
		<div class="tile cool-tile">
			<p class="n">
				{#if dSwing > 0}{dSwing}<span class="u">&nbsp;{dSwing === 1 ? 'month' : 'months'}</span>{:else}arriving{/if}
			</p>
			<p class="l">to the swing back — heavy rain, and the flood season it brings</p>
		</div>
	</div>
	<p class="note" use:reveal={{ delay: 200 }}>
		Read in {here}. Month resolution is the honest one — the record supports nothing finer.
		Every counter is a floor: so far, this event has run ahead of its precedents.
	</p>
</section>

<style>
	.clock {
		max-width: 62rem;
		margin: 0 auto;
		padding: clamp(2.5rem, 7vh, 4.5rem) 1.5rem;
		text-align: center;
	}

	.tiles {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1px;
		background: var(--ink-light-grid);
		border: 1px solid var(--ink-light-grid);
		border-radius: 14px;
		overflow: hidden;
		margin-top: 1.25rem;
	}

	.tile {
		background: var(--paper-raised);
		padding: 1.4rem 1.1rem 1.2rem;
	}

	.n {
		font-family: Fraunces, Georgia, serif;
		font-weight: 900;
		font-size: clamp(1.7rem, 4.6vw, 3.1rem);
		line-height: 1;
		margin: 0 auto 0.55em;
		max-width: none;
		font-variant-numeric: tabular-nums;
	}

	.n .u {
		font-size: 0.45em;
		font-weight: 700;
	}

	.l {
		font-size: 0.78rem;
		line-height: 1.5;
		color: var(--ink-light-secondary);
		margin: 0 auto;
		max-width: 17em;
	}

	.hot .n {
		color: var(--warm);
	}

	.cool-tile .n {
		color: var(--cool);
	}

	.note {
		font-size: 0.74rem;
		color: var(--ink-light-muted);
		max-width: 40rem;
		margin: 1.1rem auto 0;
	}

	@media (max-width: 700px) {
		.tiles {
			grid-template-columns: 1fr;
		}
	}
</style>
