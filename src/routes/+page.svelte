<script>
	/**
	 * Scene manifest — the ordered spine of the piece. Each entry is a
	 * self-contained scene component built on the ScrollScene abstraction;
	 * the divider marks the surface handover (ocean → land). Every chart reads
	 * the real Pacific Community climate-change record (static/data/), the
	 * official Pacific Data Viz Challenge 2026 dataset.
	 */
	import Scene1Signal from '$lib/components/scenes/Scene1Signal.svelte';
	import Scene2History from '$lib/components/scenes/Scene2History.svelte';
	import Scene3Descent from '$lib/components/scenes/Scene3Descent.svelte';
	import Scene4Lag from '$lib/components/scenes/Scene4Lag.svelte';
	import Scene5Garden from '$lib/components/scenes/Scene5Garden.svelte';
	import Scene6Forecast from '$lib/components/scenes/Scene6Forecast.svelte';
	import Scene7Calendar from '$lib/components/scenes/Scene7Calendar.svelte';
	import PauseBeat from '$lib/components/beats/PauseBeat.svelte';
	import TransitionMotif from '$lib/components/TransitionMotif.svelte';
	import OniBand from '$lib/components/OniBand.svelte';
</script>

<svelte:head>
	<title>The Warming Sea — Papua New Guinea's climate record, 1850–2025</title>
	<meta
		name="description"
		content="A scrollytelling read of Papua New Guinea's official climate record — 175 years of a warming ocean, its driest El Niño years, and who warms it versus who wears it. Built on the Pacific Community's climate-change dataset, the official Pacific Data Viz Challenge 2026 data on the Pacific Data Hub."
	/>
</svelte:head>

<!-- fixed connective tissue: the anomaly-scale motif at scene handovers -->
<TransitionMotif />

<main>
	<Scene1Signal />

	<!-- pause beat 1 of 2 (hard cap): the record-warm reveal gets a rest -->
	<PauseBeat
		id="pause-signal"
		surface="dark"
		kicker="+1.1 °C · the warmest year on record"
		statement="The ocean warmed first."
		exploreLabel="What is an anomaly? →"
	>
		<h4>One number a year</h4>
		<p>
			An anomaly is not the temperature — it is the <em>departure</em> from a long-term average, so
			zero means "an ordinary year" and the sign tells you warmer or cooler. The Pacific Community
			publishes one such value a year for each country, back to 1850. Reading anomalies instead of
			raw temperatures lets a century and a half of a warming ocean fit into a single climbing
			line — and makes a record-breaking year unmistakable.
		</p>
	</PauseBeat>

	<Scene2History />
	<Scene3Descent />
	<Scene4Lag />

	<!-- the ocean → land handover carries the divider motif: climate
	     variability itself as a thin geometric strip (no imagery anywhere) -->
	<div class="shore-transition no-print" aria-hidden="true">
		<OniBand />
	</div>

	<!-- pause beat 2 of 2: the data has landed; rest before the garden -->
	<PauseBeat
		id="pause-lag"
		surface="light"
		kicker="From the record to the ground"
		statement="Every number here is a year someone lived through."
		exploreLabel="Why one garden? →"
	>
		<h4>Where the numbers land</h4>
		<p>
			National annual figures are honest but distant: they average a whole country and a whole
			year into a point. The next scene leaves the charts for a single highland garden on one
			clear night, to show the mechanism the record only summarises — how a warming, drying climate
			reaches a family's food. It is an illustration, not a measurement, and it is labelled as one.
		</p>
	</PauseBeat>

	<Scene5Garden />
	<Scene6Forecast />
	<Scene7Calendar />
</main>

<footer class="colophon surface-light no-print">
	<div class="colophon-band"><OniBand /></div>
	<p>
		<strong>The Warming Sea</strong> · an entry for the Pacific Data Viz Challenge 2026
		(interactive category).
	</p>
	<p>
		Every chart is built from the <strong>Pacific Community (SPC) climate-change indicators</strong>
		— dataflow <code>SPC:DF_CLIMATE_CHANGE(1.0)</code>, exported from the Pacific Data Hub's .Stat
		Explorer (<code>stats.pacificdata.org</code>) and filtered to Papua New Guinea. It is the
		official dataset of this year's Challenge: annual, national-level observations, 1850–2025. The
		series are real and unaltered; the pipeline that extracts them is in <code>/prep</code>. Scene 5
		(the garden) is an explicitly labelled illustration of radiative frost, not data, and cites no
		source. No forecast, no synthetic values. No cookies, no tracking, fully static.
	</p>
</footer>

<style>
	.shore-transition {
		padding: 3rem 1.5rem;
		display: flex;
		justify-content: center;
		color: var(--ink-dark-axis);
		background: var(--ocean);
	}

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
