<script>
	/**
	 * Scene manifest — the ordered spine of the piece. Each entry is a
	 * self-contained scene component built on the ScrollScene abstraction;
	 * dividers mark the surface handovers (ocean → land).
	 */
	import Scene1Signal from '$lib/components/scenes/Scene1Signal.svelte';
	import Scene2History from '$lib/components/scenes/Scene2History.svelte';
	import Scene3Descent from '$lib/components/scenes/Scene3Descent.svelte';
	import Scene4Lag from '$lib/components/scenes/Scene4Lag.svelte';
	import Scene5Garden from '$lib/components/scenes/Scene5Garden.svelte';
	import Scene6Forecast from '$lib/components/scenes/Scene6Forecast.svelte';
	import Scene7Calendar from '$lib/components/scenes/Scene7Calendar.svelte';
	import PauseBeat from '$lib/components/beats/PauseBeat.svelte';
	import LagTicker from '$lib/components/LagTicker.svelte';
	import TransitionMotif from '$lib/components/TransitionMotif.svelte';
</script>

<svelte:head>
	<title>The Ocean Knows First — El Niño, drought and frost in Papua New Guinea</title>
	<meta
		name="description"
		content="Scroll through the months between a Pacific ocean signal and its consequences in Papua New Guinea — and the anticipatory actions those months make possible. Pacific Data Viz Challenge 2026."
	/>
</svelte:head>

<!-- fixed connective tissue: the lag clock and the anomaly-scale motif -->
<LagTicker />
<TransitionMotif />

<main>
	<Scene1Signal />

	<!-- pause beat 1 of 2 (hard cap): the +1.7 °C reveal gets a rest -->
	<PauseBeat
		id="pause-signal"
		surface="dark"
		kicker="+1.7 °C and rising"
		statement="The ocean knows first."
		exploreLabel="What is this number? →"
	>
		<h4>Niño 3.4, in one breath</h4>
		<p>
			The number is the sea-surface temperature anomaly of the Niño 3.4 region — a box of
			equatorial Pacific straddling the date line. Average it over three months and you get the
			Oceanic Niño Index (ONI): above +0.5 °C, El Niño conditions; above +1.5 °C, a strong
			event. It is the single most-watched number in seasonal climate forecasting — and it moves
			months before the weather over Papua New Guinea does.
		</p>
	</PauseBeat>

	<Scene2History />
	<Scene3Descent />
	<Scene4Lag />

	<div class="shore-transition no-print" aria-hidden="true"></div>

	<!-- pause beat 2 of 2: the lag has landed; rest before the garden -->
	<PauseBeat
		id="pause-lag"
		surface="light"
		kicker="T + 8 · the frost has landed"
		statement="Eight months of warning. Not one of them needs to be wasted."
		exploreLabel="What fits in eight months? →"
	>
		<h4>Anticipatory action, briefly</h4>
		<p>
			Acting on a forecast instead of a disaster: pre-positioning frost-hardy vine cuttings,
			agreeing river-corridor relief routes while the barges still run, staging seed and water
			storage before prices spike. Every action is cheaper, faster and more dignified before
			the shock than after it — the lag is the budget line that pays for all of it.
		</p>
	</PauseBeat>

	<Scene5Garden />
	<Scene6Forecast />
	<Scene7Calendar />
</main>

<footer class="colophon surface-light no-print">
	<p>
		<strong>The Ocean Knows First</strong> · an entry for the Pacific Data Viz Challenge 2026
		(interactive category).
	</p>
	<p>
		All data currently shown is <strong>synthetic placeholder data</strong> generated to the
		documented contracts in <code>/prep</code>; the production pipeline replaces it with OISST /
		ERSST sea-surface temperatures, the CPC Oceanic Niño Index, CHIRPS rainfall, and NDC /
		provincial hazard records. No cookies, no tracking, fully static.
	</p>
</footer>

<style>
	.colophon {
		padding: 2.5rem 1.5rem 3.5rem;
		font-size: 0.8rem;
		color: var(--ink-light-secondary);
	}

	.colophon p {
		max-width: 44rem;
		margin: 0 auto 0.75em;
	}
</style>
