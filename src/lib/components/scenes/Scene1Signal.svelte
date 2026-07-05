<script>
	/**
	 * Scene 1 — The Signal. Scene shell + prose; the WebGL hero itself is
	 * SignalHero.svelte (raw WebGL with PNG-poster fallback). Part 2: the
	 * narration is a step track — one idea per step — over the shader.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import SignalHero from './SignalHero.svelte';

	// one sentence per step; the +1.7 °C reveal itself belongs to the hero
	const steps = [
		{ at: [0.1, 0.26], text: 'June 2025. The water out there ran cool.', sub: 'The tail of a La Niña.' },
		{ at: [0.26, 0.42], text: 'Then, month by month, the middle of the Pacific warmed.' },
		{ at: [0.42, 0.58], text: 'A tongue of warm water spread east of the date line.' },
		{ at: [0.58, 0.72], text: 'None of this touches my country. Not yet.' },
		{ at: [0.72, 0.84], text: 'But this far-away water is the earliest warning we get.' }
	];
</script>

<ScrollScene
	id="1-signal"
	title="The Signal — the equatorial Pacific warms"
	heightVh={640}
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
		<div class="steps-anchor no-print">
			<SceneSteps {steps} {progress} width="26rem" />
		</div>
	{/snippet}
</ScrollScene>

<style>
	.steps-anchor {
		position: absolute;
		left: clamp(1.25rem, 5vw, 4rem);
		top: 24vh;
		right: 1.25rem;
		pointer-events: none;
	}

	.steps-anchor :global(.step-text) {
		text-shadow: 0 1px 18px rgba(0, 0, 0, 0.65);
	}

	.steps-anchor :global(.step-sub) {
		text-shadow: 0 1px 12px rgba(0, 0, 0, 0.65);
	}
</style>
