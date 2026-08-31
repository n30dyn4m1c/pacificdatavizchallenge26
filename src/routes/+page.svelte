<script>
	import Hero from '$lib/components/Hero.svelte';
	import { reveal } from '$lib/reveal.js';
	import { base } from '$app/paths';
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
	<meta name="description" content="Papua New Guinea's worst droughts begin 7,000 kilometres away, in the temperature of the Pacific — months before the rain fails. In 2026 that ocean is running ahead of 1982, 1997, 2015 and 2023 at the same point, and PNG's own weather service expects the drought to run into 2027. What El Niño does to PNG, and what to do about it — told through the official Pacific climate record." />
	<link rel="canonical" href="https://n30dyn4m1c.github.io/pacificdatavizchallenge26/" />
	<meta name="color-scheme" content="only light" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="The Ocean Knows First" />
	<meta property="og:url" content="https://n30dyn4m1c.github.io/pacificdatavizchallenge26/" />
	<meta property="og:title" content="The Ocean Knows First — El Niño and Papua New Guinea" />
	<meta property="og:description" content="PNG's worst droughts are announced by the ocean, months ahead. In 2026 the signal is running ahead of every great El Niño at the same point — what El Niño does to PNG, and what to do about it." />
	<meta property="og:image" content="https://n30dyn4m1c.github.io/pacificdatavizchallenge26/share/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Title card: The Ocean Knows First, above a bar chart of El Niño and La Niña years with 2026 the tallest bar." />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="The Ocean Knows First — El Niño and Papua New Guinea" />
	<meta name="twitter:description" content="PNG's worst droughts are announced by the ocean, months ahead. In 2026 the signal is running ahead of every great El Niño at the same point — what El Niño does to PNG, and what to do about it." />
	<meta name="twitter:image" content="https://n30dyn4m1c.github.io/pacificdatavizchallenge26/share/og.png" />
</svelte:head>

<main id="main">
	<Hero />

	<section class="intro" aria-label="Introduction">
		<p class="problem">
			<strong>The problem.</strong> Papua New Guinea’s worst droughts are announced months early
			by a stretch of equatorial ocean seven thousand kilometres away — yet the warning is still
			easy to miss until gardens freeze and rivers stop. This piece answers that with the official
			Pacific climate record: it shows where the signal lives, what it does at every altitude in
			PNG, and a dated preparation calendar for the 2026–27 El Niño now underway.
		</p>
		<p>
			In 1997, the rain over Papua New Guinea failed. Rivers dropped until the barges that supply
			whole districts stopped running. Gardens wilted from the coast to the high valleys, and on
			clear drought nights, highland sweet-potato gardens froze. It was the worst drought the
			country's modern record had measured. In 2015, it happened again.
		</p>
		<p>
			Both times, the first sign was not in PNG’s sky. It was in the temperature of seawater
			<span class="hl hl-cool">seven thousand kilometres east</span> — months before the rain
			failed.
		</p>
		<p>
			It is happening a third time. In 2026 that ocean is warming faster than it did in 1982,
			1997, 2015 or 2023 — the four great El Niños of the modern record — at the same point in
			their onset years. PNG’s National Weather Service declared El Niño in June, after a first
			advisory on 1 May, and expects the drought to run into 2027.
		</p>
		<p>
			What follows is the whole story, told through the
			<strong>official Pacific climate record</strong> and the reporting of the time: where the
			drought comes from, what it does to Papua New Guinea — and what can still be done about it.
		</p>
		<div class="intro-band" aria-hidden="true"><OniBand /></div>
	</section>

	<section class="tldr-wrap" aria-label="The story in three numbers">
		<div class="tldr">
			<div class="tldr-item" use:reveal>
				<p class="tldr-n">8 / 10</p>
				<p class="tldr-l">of PNG’s driest years since 1979 were El Niño years</p>
			</div>
			<div class="tldr-item" use:reveal={{ delay: 110 }}>
				<p class="tldr-n">Fastest on record</p>
				<p class="tldr-l">in 2026 the ocean signal outran 1982, 1997, 2015 and 2023 at the same point</p>
			</div>
			<div class="tldr-item" use:reveal={{ delay: 220 }}>
				<p class="tldr-n">To ~{now.calendar.hardestEnd}</p>
				<p class="tldr-l">the hard months ahead — and what to do in them is the last chapter</p>
			</div>
		</div>
	</section>

	<SceneMap />
	<SceneEngine />
	<SceneSeeSaw />
	<SceneSignal />

	<BigStat kicker="Since 1979" stat="8 / 10" caption="of Papua New Guinea’s ten driest years were El Niño years. The other two came in the aftermath of one." accent="warm" />

	<SceneIsland />
	<RiverDry />
	<FrostNight />
	<SceneGardens />
	<Aftermath />
	<NewsShelf />

	<SceneLongRecord />

	<BigStat kicker="2025" stat="+1.1 °C" caption="the sea around Papua New Guinea last year — the warmest in 176 years of record." accent="warm" />

	<SceneLedger />
	<SceneWatchers />

	<BigStat kicker={now.latest.label} stat="{now.latest.text} °C" caption="the far ocean at {now.latest.month} — warmer than 1982, 1997, 2015 or 2023 stood at the same point. By {now.scoring.when} the weekly reading was about {now.scoring.readingText} °C." accent="warm" />

	<SceneNow />
	<TheClock />
	<NewsShelf2026 />
	<CallToAction />

	<SceneRecord />
</main>

<footer class="colophon surface-light no-print">
	<img class="colophon-mark" src="{base}/turtle.png" alt="Pacific Dataviz Challenge turtle mark" width="512" height="512" />
	<div class="colophon-band"><OniBand /></div>
	<p>
		<strong>The Ocean Knows First</strong> · Neo Malesa, Port Moresby · interactive entry for the
		<a href="https://pacificdatavizchallenge.org/">Pacific Dataviz Challenge 2026</a>.
	</p>
	<p>
		Data: the <strong>Pacific Community (SPC) climate-change indicators</strong> for Papua New
		Guinea (dataflow <code>SPC:DF_CLIMATE_CHANGE(1.0)</code>, via
		<a href="https://stats.pacificdata.org/">stats.pacificdata.org</a>) — the official dataset of
		this year's Challenge, used unaltered. Official series plotted: rainfall anomalies; mean
		sea-surface temperature anomalies; mean surface temperature anomalies; sea-level anomalies;
		crop yield; greenhouse-gas emission per capita; meteorological monitoring network. One label
		is corrected, with the reasoning on the record: the dataflow publishes the rainfall-anomaly
		series in “mm”, but at these magnitudes the values are a relative anomaly index around zero —
		PNG’s rain runs to thousands of millimetres a year — so the piece plots them as published and
		describes them as index points; no ranking or correlation is affected.
		El Niño years and chapter nine's monthly series: <strong>NOAA</strong>
		(<a href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/">Oceanic Niño Index</a>;
		<a href="https://psl.noaa.gov/data/correlation/nina34.anom.data">Niño 3.4 monthly anomaly</a>,
		ERSST-based, observed through {now.latest.label}; plus one quoted CPC weekly reading on an
		OISST basis). World-average emissions:
		<a href="https://edgar.jrc.ec.europa.eu/report_2024">EDGAR (EC-JRC)</a>.
		Coastlines: <a href="https://www.naturalearthdata.com/">Natural Earth</a>.
		Drawings of mechanisms are labelled as illustrations; chapter nine's one forward-looking panel
		is a historical analogue, labelled an estimate and checked against the official
		<a href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml">NOAA CPC</a>
		/ <a href="https://iri.columbia.edu/our-expertise/climate/forecasts/enso/current/">IRI</a>
		and <a href="https://wmo.int/publication-series/el-ninola-nina-updates">WMO</a> outlooks.
		Live coverage current to <strong>{now.updated.label}</strong>.
		No cookies, no tracking, fully static. This URL is intended to remain public through 31 August 2029.
	</p>
	<p>
		Built under my creative direction with AI assistance from <strong>Claude</strong>,
		<strong>Grok</strong> and <strong>DeepSeek</strong>.
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
	.intro p { margin-bottom: 1.2em; }
	.problem {
		padding: 0.85rem 1rem;
		border-left: 3px solid var(--accent-light);
		background: color-mix(in srgb, var(--paper-raised) 80%, transparent);
		border-radius: 0 10px 10px 0;
	}
	.intro-band {
		display: flex;
		justify-content: center;
		padding: 2rem 0 0;
		color: var(--ink-light-axis);
	}
	/* the outer padding belongs to the section, NOT to the bordered grid:
	   the grid paints its own background as the 1px gap between cards, so
	   any padding on it shows up as a dead grey band inside the border */
	.tldr-wrap {
		max-width: 62rem;
		margin: 0 auto;
		padding: 0 1.5rem clamp(2.5rem, 7vh, 4rem);
	}
	.tldr {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1px;
		background: var(--ink-light-grid);
		border: 1px solid var(--ink-light-grid);
		border-radius: 14px;
		overflow: hidden;
	}
	.tldr-item { background: var(--paper-raised); padding: 1.2rem 1.3rem 1.1rem; }
	.tldr-n {
		font-family: Fraunces, Georgia, serif;
		font-weight: 900;
		font-size: clamp(1.3rem, 2.8vw, 1.8rem);
		line-height: 1.1;
		margin: 0 0 0.35em;
		max-width: none;
	}
	.tldr-l { font-size: 0.86rem; line-height: 1.5; color: var(--ink-light-secondary); margin: 0; }
	@media (max-width: 700px) { .tldr { grid-template-columns: 1fr; } }
	.colophon {
		padding: 2.5rem 1.5rem 3.5rem;
		font-size: 0.8rem;
		color: var(--ink-light-secondary);
		border-top: 1px solid var(--ink-light-grid);
	}
	.colophon-mark { display: block; height: 4.25rem; width: auto; margin: 0 auto 0.9rem; }
	.colophon p { max-width: 44rem; margin: 0 auto 0.75em; }
	.colophon-band { color: var(--ink-light-axis); margin-bottom: 1.75rem; }
</style>
