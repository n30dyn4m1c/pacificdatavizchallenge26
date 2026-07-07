<script>
	/**
	 * The Ocean Knows First — the page spine. A light, editorial scrollytelling
	 * journey in six chapters: the drought signal travels from the far ocean
	 * (the ENSO see-saw) to Papua New Guinea's rain, down into its gardens,
	 * across the 176-year warming record beneath, through the emissions
	 * ledger, and ends with the watchers who read the signal early. Every
	 * chapter is a sticky graphic with white step cards scrolling over it
	 * (ScrollScene + the /lib/scrolly.js card convention). Data: the official
	 * SPC record plus the documented NOAA ONI companion (see /prep).
	 */
	import Hero from '$lib/components/Hero.svelte';
	import BigStat from '$lib/components/BigStat.svelte';
	import OniBand from '$lib/components/OniBand.svelte';
	import Ch1SeeSaw from '$lib/components/scenes/Ch1SeeSaw.svelte';
	import Ch2Signal from '$lib/components/scenes/Ch2Signal.svelte';
	import Ch3Gardens from '$lib/components/scenes/Ch3Gardens.svelte';
	import Ch4LongRecord from '$lib/components/scenes/Ch4LongRecord.svelte';
	import Ch5Ledger from '$lib/components/scenes/Ch5Ledger.svelte';
	import Ch6Watchers from '$lib/components/scenes/Ch6Watchers.svelte';
	import SceneRecord from '$lib/components/scenes/SceneRecord.svelte';
</script>

<svelte:head>
	<title>The Ocean Knows First — Papua New Guinea and the far ocean that takes its rain</title>
	<meta
		name="description"
		content="Papua New Guinea's worst droughts start in the temperature of seawater seven thousand kilometres east, months before the rain fails. A scrollytelling journey through 176 years of the official Pacific climate record — the Pacific Community's climate-change dataset on the Pacific Data Hub, with the NOAA Oceanic Niño Index naming the El Niño years."
	/>
</svelte:head>

<main>
	<Hero />

	<!-- the cold open: 1997, in prose, before a single chart -->
	<section class="intro" aria-label="Introduction">
		<p>
			In the middle of 1997, the rain over Papua New Guinea began to fail. By the end of the year
			it was the driest year ever measured there — gardens wilted in the lowlands, and in the
			Highlands, on cloudless drought nights, entire hillsides of sweet potato froze. Nearly two
			decades later, in 2015, it happened again.
		</p>
		<p>
			Here is the strange part: the first sign was never in the sky over Papua New Guinea. It was
			in the temperature of seawater <span class="hl hl-cool">seven thousand kilometres east</span>
			— months earlier.
		</p>
		<p>
			This is the story of that signal, told entirely through the
			<strong>official climate record</strong>: the Pacific Community’s indicators for Papua New
			Guinea, one number a year, some series back to 1850. Six charts. No forecasts, no synthetic
			data — just the record, read in order.
		</p>
		<div class="intro-band" aria-hidden="true"><OniBand /></div>
	</section>

	<Ch1SeeSaw />
	<Ch2Signal />

	<BigStat
		kicker="Since 1979"
		stat="8 / 10"
		caption="of Papua New Guinea’s driest years were El Niño years. The other two trailed one."
		accent="warm"
	/>

	<Ch3Gardens />
	<Ch4LongRecord />

	<BigStat
		kicker="2025"
		stat="+1.1 °C"
		caption="the warmest sea around Papua New Guinea in 176 years of record."
		accent="warm"
	/>

	<Ch5Ledger />
	<Ch6Watchers />

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
		real and unaltered; the pipeline that extracts them is in <code>/prep</code>. Two documented
		companions from open sources name what the SPC record cannot: the El Niño years come from the
		<strong>NOAA Climate Prediction Center's Oceanic Niño Index</strong>, and the world-average
		emissions reference (≈6.6 t CO₂e/person) from <strong>EDGAR</strong> (EC-JRC). The frost story
		in chapter three is an explicitly labelled illustration of a mechanism, not data. No forecast,
		no synthetic values. No cookies, no tracking, fully static.
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
