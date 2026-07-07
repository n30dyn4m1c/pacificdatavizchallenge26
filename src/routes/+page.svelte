<script>
	/**
	 * Scene manifest — the ordered spine of the piece: a data detective story
	 * in seven exhibits and a coda. Papua New Guinea's rain keeps failing; its
	 * own warming sea has an alibi; the thief is the far ocean (El Niño). Each
	 * entry is a self-contained scene component built on the ScrollScene
	 * abstraction. Every chart reads the real Pacific Community climate-change
	 * record (static/data/), the official Pacific Data Viz Challenge 2026
	 * dataset — plus one small documented companion, the NOAA CPC Oceanic Niño
	 * Index (see /prep).
	 */
	import Scene1Signal from '$lib/components/scenes/Scene1Signal.svelte';
	import SceneDry from '$lib/components/scenes/SceneDry.svelte';
	import SceneAlibi from '$lib/components/scenes/SceneAlibi.svelte';
	import SceneReveal from '$lib/components/scenes/SceneReveal.svelte';
	import SceneCost from '$lib/components/scenes/SceneCost.svelte';
	import SceneExposure from '$lib/components/scenes/SceneExposure.svelte';
	import SceneGap from '$lib/components/scenes/SceneGap.svelte';
	import SceneWatch from '$lib/components/scenes/SceneWatch.svelte';
	import SceneRecord from '$lib/components/scenes/SceneRecord.svelte';
	import PauseBeat from '$lib/components/beats/PauseBeat.svelte';
	import TransitionMotif from '$lib/components/TransitionMotif.svelte';
	import OniBand from '$lib/components/OniBand.svelte';
</script>

<svelte:head>
	<title>Stolen Rain — who takes Papua New Guinea's rain?</title>
	<meta
		name="description"
		content="A scrollytelling inquiry into Papua New Guinea's official climate record: the driest years keep coming back, the country's own warming sea has an alibi, and the thief is an ocean 7,000 km away. Built on the Pacific Community's climate-change dataset — the official Pacific Data Viz Challenge 2026 data on the Pacific Data Hub — with the NOAA Oceanic Niño Index naming the El Niño years."
	/>
</svelte:head>

<!-- fixed connective tissue: the anomaly-scale motif at scene handovers -->
<TransitionMotif />

<main>
	<!-- Act I — the record: the obvious suspect, warming to its 2025 high -->
	<Scene1Signal />

	<!-- pause beat 1 of 2 (hard cap): rest after the record-warm reveal -->
	<PauseBeat
		id="pause-record"
		surface="dark"
		kicker="+1.1 °C · the warmest of 176 years"
		statement="The sea is warming. That is not the mystery."
		exploreLabel="What is an anomaly? →"
	>
		<h3>One number a year</h3>
		<p>
			An anomaly is not the temperature — it is the <em>departure</em> from a long-term average, so
			zero means "an ordinary year" and the sign tells you warmer or cooler. The Pacific Community
			publishes one such value a year for each country, back to 1850. Reading anomalies instead of
			raw temperatures lets a century and a half of a warming ocean fit into a single climbing
			line — and makes a record-breaking year unmistakable.
		</p>
	</PauseBeat>

	<!-- Acts II–IV — the crime, the alibi, the reveal -->
	<SceneDry />
	<SceneAlibi />
	<SceneReveal />

	<!-- pause beat 2 of 2: the verdict gets a rest before the consequences -->
	<PauseBeat
		id="pause-verdict"
		surface="dark"
		kicker="The verdict"
		statement="The thief lives seven thousand kilometres away."
		exploreLabel="Why does a far ocean move the rain here? →"
	>
		<h3>The rising air moves east</h3>
		<p>
			The Pacific's rain follows its warmest water. In an ordinary year that water — and the great
			column of rising, cloud-building air above it — sits in the west, over and around Papua New
			Guinea. In an El Niño year the warm water slides east along the equator and the rising air
			goes with it; what descends over the western Pacific in exchange is dry. Papua New Guinea's
			drought is not a local accident but one end of an ocean-wide see-saw — which is why a
			national dataset can record the wound but not the weapon.
		</p>
	</PauseBeat>

	<!-- Acts V–VII — the cost, the double exposure, the gap -->
	<SceneCost />
	<SceneExposure />
	<SceneGap />

	<!-- Coda — watching for the next one -->
	<SceneWatch />

	<!-- the dark → paper handover carries the divider motif: ENSO variability
	     itself as a thin geometric strip (no imagery anywhere) -->
	<div class="shore-transition no-print" aria-hidden="true">
		<OniBand />
	</div>

	<!-- Epilogue — the whole record as the case file's appendix (prints) -->
	<SceneRecord />
</main>

<footer class="colophon surface-light no-print">
	<div class="colophon-band"><OniBand /></div>
	<p>
		<strong>Stolen Rain</strong> · an entry for the Pacific Data Viz Challenge 2026
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
		in Act V is an explicitly labelled illustration of a mechanism, not data. No forecast, no
		synthetic values. No cookies, no tracking, fully static.
	</p>
</footer>

<style>
	/* .shore-transition itself is styled globally in app.css (the dark → paper
	   gradient carrying the OniBand divider) */

	.colophon {
		padding: 2.5rem 1.5rem 3.5rem;
		font-size: 0.8rem;
		color: var(--ink-light-secondary);
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
