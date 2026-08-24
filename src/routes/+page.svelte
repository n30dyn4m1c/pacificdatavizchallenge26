<script>
	/**
	 * The Ocean Knows First — the page spine. A light, editorial scrollytelling
	 * journey in nine chapters plus field notes: the map of the two oceans,
	 * the ENSO see-saw, the rain that mirrors it, the island in cross-section
	 * (coast → rivers → Highlands day and night), the harvest record, the
	 * 176-year warming record beneath, the emissions ledger, the watchers
	 * who read the signal early — and chapter nine, the present: the 2026
	 * El Niño month by month against its four precedents, with the piece's
	 * one labelled estimate of the months ahead. Between chapters: two
	 * interactive field notes (the drying river, the frost night), the
	 * aftermath (the floods that follow), two paper trails of real coverage
	 * (1997/2015 archives, and 2026 live), and the closing ask — prepare for
	 * the predictable. Every scrolly chapter is a sticky graphic with white
	 * step cards over it (ScrollScene + /lib/scrolly.js). Data: the official
	 * SPC record plus documented companions (NOAA ONI, NOAA PSL Niño 3.4
	 * monthly, Natural Earth geometry — see /prep); illustrations and the
	 * one estimate are labelled as such.
	 */
	import Hero from '$lib/components/Hero.svelte';
	// chapter nine's headline numbers, written by prep/make_real_data.mjs — the
	// BigStat and the colophon quote the same values the chapter does, and both
	// follow automatically when NOAA appends a month
	import { now } from '$lib/generated/now-copy.js';
	import BigStat from '$lib/components/BigStat.svelte';
	import OniBand from '$lib/components/OniBand.svelte';
	import SceneMap from '$lib/components/scenes/SceneMap.svelte';
	import SceneEngine from '$lib/components/scenes/SceneEngine.svelte';
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
	import SceneNow from '$lib/components/scenes/SceneNow.svelte';
	import TheClock from '$lib/components/TheClock.svelte';
	import NewsShelf2026 from '$lib/components/NewsShelf2026.svelte';
	import CallToAction from '$lib/components/CallToAction.svelte';
	import SceneRecord from '$lib/components/scenes/SceneRecord.svelte';
</script>

<svelte:head>
	<title>The Ocean Knows First — El Niño and Papua New Guinea: the warning, the drought, the preparation</title>
	<meta
		name="description"
		content="Papua New Guinea's worst droughts begin 7,000 kilometres away, in the temperature of the Pacific — months before the rain fails. In 2026 that ocean is warming faster than in any of the four strongest El Niños on record, and PNG's own weather service expects the drought to run into 2027. What El Niño does to PNG, and what to do about it — told through the official Pacific climate record."
	/>
</svelte:head>

<main>
	<Hero />

	<!-- the cold open: 1997, in prose, before a single chart -->
	<section class="intro" aria-label="Introduction">
		<p>
			In 1997, the rain over Papua New Guinea failed. Rivers dropped until the barges that supply
			whole districts stopped running. Gardens wilted from the coast to the high valleys, and on
			clear drought nights, highland sweet-potato gardens froze. It was the driest year ever
			measured in the country. In 2015, it happened again.
		</p>
		<p>
			Both times, the first sign was not in PNG’s sky. It was in the temperature of seawater
			<span class="hl hl-cool">seven thousand kilometres east</span> — months before the rain
			failed.
		</p>
		<p>
			It is happening a third time. In 2026 that ocean is warming faster than it did in 1982,
			1997, 2015 or 2023 — the four strongest events on record. PNG’s National Weather Service
			declared El Niño in May and expects the drought to run into 2027.
		</p>
		<p>
			What follows is the whole story, told through the
			<strong>official Pacific climate record</strong> and the reporting of the time: where the
			drought comes from, what it does to Papua New Guinea — and what can still be done about it.
		</p>
		<div class="intro-band" aria-hidden="true"><OniBand /></div>
	</section>

	<SceneMap />
	<SceneEngine />
	<SceneSeeSaw />
	<SceneSignal />

	<BigStat
		kicker="Since 1979"
		stat="8 / 10"
		caption="of Papua New Guinea’s ten driest years were El Niño years. The other two came in the aftermath of one."
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
		caption="the sea around Papua New Guinea last year — the warmest in 176 years of record."
		accent="warm"
	/>

	<SceneLedger />
	<SceneWatchers />

	<BigStat
		kicker={now.latest.label}
		stat="{now.latest.text} °C"
		caption="the far ocean at {now.latest.month} — warmer than 1982, 1997, 2015 or 2023 stood at the same point. By mid-{now.scoring.month} the weekly reading was about {now.scoring.readingText} °C."
		accent="warm"
	/>

	<SceneNow />
	<TheClock />
	<NewsShelf2026 />
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
		Data: the <strong>Pacific Community (SPC) climate-change indicators</strong> for Papua New
		Guinea (dataflow <code>SPC:DF_CLIMATE_CHANGE(1.0)</code>, via
		<code>stats.pacificdata.org</code>) — the official dataset of this year's Challenge, used
		unaltered. El Niño years and chapter nine's monthly series:
		<strong>NOAA</strong> (Oceanic Niño Index; Niño 3.4, observed through {now.latest.label}).
		World-average emissions: <strong>EDGAR</strong> (EC-JRC). Coastlines:
		<strong>Natural Earth</strong>. Drawings of mechanisms are labelled as illustrations; chapter
		nine's one forward-looking panel is labelled an estimate and checked against the official
		<strong>NOAA CPC / IRI</strong> and <strong>WMO</strong> outlooks. Live coverage current to
		<strong>6 August 2026</strong>. No cookies, no tracking, fully static.
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
