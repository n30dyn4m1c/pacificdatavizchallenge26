<script>
	/**
	 * Scene 1 — The Signal. Scene shell + prose; the WebGL hero itself is
	 * SignalHero.svelte (raw WebGL with PNG-poster fallback).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SignalHero from './SignalHero.svelte';
</script>

<ScrollScene
	id="1-signal"
	title="The Signal — the equatorial Pacific warms"
	heightVh={560}
	surface="dark"
	dataUrl="/data/scene1_sst_field.json"
>
	{#snippet prose()}
		<h2>The signal</h2>
		<p>
			In June 2025 the equatorial Pacific ran cool — the tail of a La Niña. Month by month
			through late 2025 and into 2026, a tongue of unusually warm surface water spread along the
			equator east of the date line. By June 2026 the Niño 3.4 anomaly stood at +1.7 °C and
			rising: a strong El Niño taking shape. For Papua New Guinea, this patch of far-away ocean
			is the earliest warning there is — the ocean knows first, months before the rain fails or
			the frost falls.
		</p>
	{/snippet}

	{#snippet children({ progress, active, data })}
		<SignalHero {progress} {active} {data} />
	{/snippet}
</ScrollScene>
