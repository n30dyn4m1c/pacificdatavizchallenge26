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

	const scenes = [
		{ component: Scene1Signal, divider: false },
		{ component: Scene2History, divider: false },
		{ component: Scene3Descent, divider: false },
		{ component: Scene4Lag, divider: 'shore' }, // ocean → land handover follows
		{ component: Scene5Garden, divider: false },
		{ component: Scene6Forecast, divider: false },
		{ component: Scene7Calendar, divider: false }
	];
</script>

<svelte:head>
	<title>The Ocean Knows First — El Niño, drought and frost in Papua New Guinea</title>
	<meta
		name="description"
		content="Scroll through the months between a Pacific ocean signal and its consequences in Papua New Guinea — and the anticipatory actions those months make possible. Pacific Data Viz Challenge 2026."
	/>
</svelte:head>

<main>
	{#each scenes as s, i (i)}
		<s.component />
		{#if s.divider === 'shore'}
			<div class="shore-transition no-print" aria-hidden="true"></div>
		{/if}
	{/each}
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
