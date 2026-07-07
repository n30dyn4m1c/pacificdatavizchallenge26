<script>
	/**
	 * The Ocean Knows First — the page spine. A light, editorial scrollytelling
	 * journey in eight chapters plus field notes: the map of the two oceans,
	 * the ENSO see-saw, the rain that mirrors it, the island in cross-section
	 * (coast → rivers → Highlands day and night), the harvest record, the
	 * 176-year warming record beneath, the emissions ledger, and the watchers
	 * who read the signal early. Between chapters: two interactive field notes
	 * (the drying river, the frost night), the aftermath (the floods that
	 * follow), the paper trail of real coverage, and the closing ask —
	 * prepare for the predictable. Every scrolly chapter is a sticky graphic
	 * with white step cards over it (ScrollScene + /lib/scrolly.js). Data:
	 * the official SPC record plus documented companions (NOAA ONI, Natural
	 * Earth geometry — see /prep); illustrations are labelled as such.
	 */
	import Hero from '$lib/components/Hero.svelte';
	import BigStat from '$lib/components/BigStat.svelte';
	import OniBand from '$lib/components/OniBand.svelte';
	import SceneMap from '$lib/components/scenes/SceneMap.svelte';
	import SceneSeeSaw from '$lib/components/scenes/SceneSeeSaw.svelte';
	import SceneSignal from '$lib/components/scenes/SceneSignal.svelte';
	import SceneIsland from '$lib/components/scenes/SceneIsland.svelte';
	import RiverDry from '$lib/components/RiverDry.svelte';
	import FrostNight from '$lib/components/FrostNight.svelte';
	import SceneGardens from '$lib/components/scenes/SceneGardens.svelte';
	import Aftermath from '$lib/components/Aftermath.svelte';
	import NewsShelf from '$lib/components/NewsShelf.svelte';
	import SceneLongRecord from '$lib/components/scenes/SceneLongRecord.svelte';
	import SceneLedger from '$lib/components/scenes/SceneLedger.svelte';
	import SceneWatchers from '$lib/components/scenes/SceneWatchers.svelte';
	import CallToAction from '$lib/components/CallToAction.svelte';
	import SceneRecord from '$lib/components/scenes/SceneRecord.svelte';
</script>

<svelte:head>
	<title>The Ocean Knows First — Papua New Guinea and the far ocean that takes its rain</title>
	<meta
		name="description"
		content="Papua New Guinea's worst droughts start in the temperature of seawater seven thousand kilometres east, months before the rain fails — and the damage runs from dry coastal tanks to stranded river barges to frost-killed highland gardens. A scrollytelling journey through 176 years of the official Pacific climate record, with the real coverage of 1997 and 2015, and one ask: prepare for the predictable."
	/>
</svelte:head>

<main>
	<Hero />

	<!-- the cold open: 1997, in prose, before a single chart -->
	<section class="intro" aria-label="Introduction">
		<p>
			In the middle of 1997, the rain over Papua New Guinea began to fail. By the end of the year
			it was the driest year ever measured there — rivers fell until the barges stopped, gardens
			wilted from the coast to the valleys, and in the Highlands, on cloudless drought nights,
			entire hillsides of sweet potato froze. Nearly two decades later, in 2015, it happened
			again.
		</p>
		<p>
			The first sign was never in the sky over Papua New Guinea. It was in the temperature of
			seawater <span class="hl hl-cool">seven thousand kilometres east</span> — months earlier.
		</p>
		<p>
			This is the story of that signal, told through the <strong>official climate record</strong> —
			the Pacific Community’s indicators for Papua New Guinea, one number a year, some series back
			to 1850 — with the real reporting from 1997 and 2015 alongside it. No forecasts, no synthetic
			data; where the piece draws a mechanism instead of measuring it, it says so on the drawing.
			It ends with the only conclusion the record supports: this will happen again, on a schedule
			the ocean announces — so it can be prepared for.
		</p>
		<div class="intro-band" aria-hidden="true"><OniBand /></div>
	</section>

	<SceneMap />
	<SceneSeeSaw />
	<SceneSignal />

	<BigStat
		kicker="Since 1979"
		stat="8 / 10"
		caption="of Papua New Guinea’s driest years were El Niño years. The other two trailed one."
		accent="warm"
	/>

	<SceneIsland />
	<RiverDry />
	<FrostNight />
	<SceneGardens />
	<Aftermath />
	<NewsShelf />

	<SceneLongRecord />

	<BigStat
		kicker="2025"
		stat="+1.1 °C"
		caption="the warmest sea around Papua New Guinea in 176 years of record."
		accent="warm"
	/>

	<SceneLedger />
	<SceneWatchers />
	<CallToAction />

	<SceneRecord />
</main>

<footer class="colophon surface-light no-print">
	<div class="colophon-band"><OniBand /></div>
	<p>
		<strong>The Ocean Knows First</strong> · an entry for the Pacific Data Viz Challenge 2026
		(interactive category).
	</p>
	<p>
		Every chart is built from the <strong>Pacific Community (SPC) climate-change indicators</strong>
		— dataflow <code>SPC:DF_CLIMATE_CHANGE(1.0)</code>, exported from the Pacific Data Hub's .Stat
		Explorer (<code>stats.pacificdata.org</code>) and filtered to Papua New Guinea. It is the
		official dataset of this year's Challenge: annual, national-level observations, 1850–2025, used
		real and unaltered; the pipeline that extracts them is in <code>/prep</code>. Documented
		companions from open sources supply what the SPC record cannot: the El Niño years come from the
		<strong>NOAA Climate Prediction Center's Oceanic Niño Index</strong>, the world-average
		emissions reference (≈6.6 t CO₂e/person) from <strong>EDGAR</strong> (EC-JRC), and the
		coastlines and rivers on both maps from <strong>Natural Earth</strong> (public domain). The
		cross-section, the field notes and the aftermath hillside are explicitly labelled illustrations
		of mechanisms, and carry no dataset numbers; the paper-trail section links to external
		reporting, summarised by this piece. No forecast, no synthetic values. No cookies, no tracking,
		fully static.
	</p>
</footer>

<style>
	.intro {
		max-width: 38rem;
		margin: 0 auto;
		padding: clamp(3rem, 10vh, 6rem) 1.5rem 1rem;
		font-size: clamp(1.05rem, 2.3vw, 1.22rem);
		line-height: 1.7;
	}

	.intro p {
		margin-bottom: 1.2em;
	}

	.intro-band {
		display: flex;
		justify-content: center;
		padding: 2rem 0 0;
		color: var(--ink-light-axis);
	}

	.colophon {
		padding: 2.5rem 1.5rem 3.5rem;
		font-size: 0.8rem;
		color: var(--ink-light-secondary);
		border-top: 1px solid var(--ink-light-grid);
	}

	.colophon p {
		max-width: 44rem;
		margin: 0 auto 0.75em;
	}

	.colophon-band {
		color: var(--ink-light-axis);
		margin-bottom: 1.75rem;
	}
</style>
