<script>
	/**
	 * Act I — The record. Scene shell + prose; the WebGL hero itself is
	 * SignalHero.svelte (raw WebGL with PNG-poster fallback). The piece opens
	 * on the obvious suspect: Papua New Guinea's own sea, warming across 176
	 * years of the official record to its 2025 high. The narration is a step
	 * track — one idea per step — over the shader.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import SignalHero from './SignalHero.svelte';

	// one sentence per step; the record-warm reveal itself belongs to the hero
	const steps = [
		{ at: [0.1, 0.26], text: 'Start with what the record shows plainly.', sub: 'One number a year, back to 1850: the sea’s departure from its long-term average.' },
		{ at: [0.26, 0.42], text: 'For a century the anomaly wandered near zero.' },
		{ at: [0.42, 0.58], text: 'Then, from the late 20th century, it began to climb.' },
		{ at: [0.58, 0.72], text: 'The warm years stopped being exceptions.' },
		{ at: [0.72, 0.84], text: 'By 2025, the warmest reading in the whole record.' }
	];
</script>

<ScrollScene
	id="1-record"
	title="The record — Papua New Guinea's annual sea-surface-temperature anomaly, 1850–2025"
	heightVh={640}
	surface="dark"
	dataUrl="/data/scene_record_sst.json"
>
	{#snippet prose()}
		<h2>Exhibit A: the record</h2>
		<p>
			Papua New Guinea's driest years keep coming back — 1997, 2015, droughts and highland frosts
			that people remember by name — and this piece asks the record who takes the rain. It opens
			with the obvious suspect. The Pacific Community's record of Papua New Guinea's
			sea-surface-temperature anomaly runs annually from 1850 to 2025 — each year one number, the
			departure of that year's ocean from the long-term average. Through the 19th and early 20th
			centuries it wandered close to zero. From the late 20th century it climbs, and the warm years
			stop being exceptions. The 2025 reading, +1.1&nbsp;°C, is the warmest in the entire 176-year
			record. This scene scrolls through every year of that record; the colour of the sea is that
			year's anomaly.
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
