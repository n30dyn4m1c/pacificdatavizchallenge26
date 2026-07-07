<script>
	/**
	 * SignalHero — the Scene 1 hero shell. This part is eager and prerenders:
	 * the poster backdrop, the title block and the data readouts, so the hero
	 * paints meaningfully (ocean texture + "The Warming Sea") from static HTML
	 * before any script runs — the priority for slow PNG connections.
	 *
	 * The live WebGL field is SignalCanvas, split into its own chunk and
	 * dynamically imported here ONLY when motion is allowed and the grids have
	 * arrived. Under prefers-reduced-motion we never load it: the two posters
	 * (cool → warm) crossfade with scroll instead — the reduced-motion path is
	 * a static poster crossfade, exactly as specified. If WebGL is missing or
	 * fails, the posters simply remain visible beneath the (empty) canvas.
	 */
	import { base } from '$app/paths';
	import { ui } from '$lib/state.svelte.js';

	let { progress = 0, active = false, data = null } = $props();

	// scrub reaches the latest year at 80% progress; the last 20% pins there
	const timeP = $derived(Math.min(1, progress / 0.8));

	// lazy WebGL overlay: loaded once, only when live motion is warranted
	let Canvas = $state(null);
	let canvasRequested = false;
	$effect(() => {
		if (!canvasRequested && data && !ui.reducedMotion) {
			canvasRequested = true;
			import('./SignalCanvas.svelte').then((m) => (Canvas = m.default));
		}
	});
</script>

<div class="hero">
	<!-- poster backdrop: always present (immediate paint, reduced-motion path
	     and no-WebGL fallback in one). The live shader, when loaded, draws
	     over it. -->
	<div class="posters" aria-hidden="true">
		<img src="{base}/posters/sst_cool.png" alt="" />
		<img src="{base}/posters/sst_warm.png" alt="" style:opacity={timeP} />
	</div>

	{#if Canvas}
		<Canvas {progress} {active} {data} />
	{/if}

	<div class="title-block" style:opacity={Math.max(0, 1 - progress * 11)}>
		<p class="kicker">Pacific Data Viz Challenge 2026 · Papua New Guinea</p>
		<h1 class="display">Stolen<br />Rain</h1>
		<p class="standfirst">
			Papua New Guinea’s driest years keep coming back — and its own warming sea has an alibi.
			An inquiry into 176 years of the official Pacific climate record, from the Pacific
			Community’s data on the Pacific Data Hub.
		</p>
		<span class="scroll-hint">scroll ↓</span>
	</div>

	{#if data}
		{@const yr = data.years[Math.round(timeP * (data.years.length - 1))]}
		<div class="date-readout" style:opacity={progress > 0.04 && progress < 0.78 ? 1 : 0}>
			<span class="kicker">Papua New Guinea · annual sea-surface-temperature anomaly</span>
			<span class="date display">{yr.year}</span>
			<span class="val">{yr.value > 0 ? '+' : ''}{yr.value.toFixed(1)} °C vs the long-term average</span>
		</div>

		<div class="latest" style:opacity={Math.max(0, (progress - 0.82) / 0.12)}>
			<span class="big-numeral" style="color:var(--accent-dark)">
				+{data.latest.value.toFixed(1)} °C
			</span>
			<span class="latest-caption">
				{data.latest.year} — the warmest year in 176 years of record. An obvious suspect for the
				missing rain. Too obvious.
			</span>
		</div>
	{/if}
</div>

<style>
	.hero {
		position: relative;
		height: 100%;
	}

	.posters {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.posters img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.2s linear;
	}

	.title-block {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 1.5rem;
		pointer-events: none;
	}

	h1 {
		font-size: clamp(2.8rem, 10vw, 6.5rem);
		font-weight: 900;
		margin: 0.4em 0;
		text-shadow: 0 2px 30px rgba(0, 0, 0, 0.6);
	}

	.standfirst {
		max-width: 36em;
		color: var(--ink-dark-secondary);
	}

	.scroll-hint {
		margin-top: 2.5rem;
		font-size: 0.8rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--ink-dark-muted);
		animation: bob 2.2s ease-in-out infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-hint {
			animation: none;
		}
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(8px);
		}
	}

	.date-readout {
		position: absolute;
		left: 1.5rem;
		bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		transition: opacity 0.3s;
	}

	.date {
		font-size: clamp(1.6rem, 4.5vw, 2.6rem);
		font-weight: 700;
		font-family: Fraunces, Georgia, serif;
	}

	.val {
		font-variant-numeric: tabular-nums;
		color: var(--ink-dark-secondary);
	}

	.latest {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: 0.75rem;
		pointer-events: none;
	}

	.latest-caption {
		max-width: 26em;
		color: var(--ink-dark-secondary);
		text-shadow: 0 1px 12px rgba(0, 0, 0, 0.7);
	}
</style>
