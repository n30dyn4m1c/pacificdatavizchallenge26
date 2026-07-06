<script>
	/**
	 * Scene 5 — One garden (ILLUSTRATIVE). A large layered SVG cross-section of
	 * a kaukau mound at ~2,300 m (MoundIllustration, lazy-loaded) with two
	 * scroll phases: night falls (sky darkens, the temperature readout drops)
	 * and, once the readout crosses freezing, the frost lands (crystal creep +
	 * leaf burn + soil cracks).
	 *
	 * This scene is a diagram, not data: it explains the well-understood
	 * mechanism of radiative frost so the record's numbers land on something
	 * human. It carries no data claim and cites no source. Five <Hotspot> dots
	 * add optional enrichment; the steps alone tell the complete story.
	 */
	import { onDestroy } from 'svelte';
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import Hotspot from '$lib/components/beats/Hotspot.svelte';
	import FrostCanvas from './FrostCanvas.svelte';

	const steps = [
		{ at: [0.02, 0.09], text: 'One garden: a mounded plot of kaukau, high in the mountains.' },
		{ at: [0.09, 0.16], text: 'Sweet potato — kaukau — is the staple of the Highlands.' },
		{ at: [0.16, 0.23], text: 'Planted months ago; dug months from now.', sub: 'A garden is a slow clock.' },
		{ at: [0.24, 0.32], text: 'Dusk. The sky is clear in every direction.' },
		{ at: [0.32, 0.4], text: 'Clear is the danger.', sub: 'Cloud is a blanket, and tonight there is none.' },
		{ at: [0.4, 0.48], text: 'The day’s heat leaves the ground — straight up, into space.' },
		{ at: [0.48, 0.56], text: 'Watch the number.' },
		{ at: [0.56, 0.66], text: 'By 4 a.m., frost — in a garden that should be too warm for it.' },
		{ at: [0.66, 0.75], text: 'One clear night. That is all it takes.' },
		{ at: [0.75, 0.83], text: 'The vines are black by noon.', sub: 'The tubers below survived — but nothing feeds them now.' },
		{ at: [0.83, 0.9], text: 'The cuttings needed to replant died in the same hour.', sub: 'So the loss reaches into next season too.' },
		{ at: [0.9, 0.97], text: 'The garden’s own signs and the instruments tell one story.' }
	];

	// hotspot anchors, % of the 1000×700 illustration stage
	const HS_POS = {
		leaves: { x: 63, y: 47 },
		soil: { x: 36, y: 58 },
		tuber: { x: 50, y: 71 },
		sky: { x: 82, y: 16 },
		indicator: { x: 13, y: 49 }
	};

	// one open card at a time across the whole stage
	const hsGroup = $state({ open: null });

	// lazy-load the illustration chunk as the scene's data arrives
	let Mound = $state(null);
	function onData() {
		import('./MoundIllustration.svelte').then((m) => (Mound = m.default));
	}

	// ── phase mapping ────────────────────────────────────────────────────
	const NIGHT_END = 0.5;
	const FROST_START = 0.52;
	const FROST_SPAN = 0.3;
	const TEMP_SPAN = 0.78;
	const clamp01 = (v) => Math.max(0, Math.min(1, v));

	// idle invite: hotspots pulse only after ~2 s without scroll movement
	let pulse = $state(false);
	let idleTimer = 0;
	function onProgress(p, active) {
		pulse = false;
		clearTimeout(idleTimer);
		if (active) idleTimer = setTimeout(() => (pulse = true), 2000);
		// a hotspot card is fixed to the viewport bottom on mobile; close any
		// open one when the scene scrolls away so it can't linger over another
		else hsGroup.open = null;
	}
	onDestroy(() => clearTimeout(idleTimer));
</script>

<ScrollScene
	id="5-garden"
	title="One garden — an illustrated frost night at 2,300 metres"
	heightVh={900}
	surface="light"
	dataUrl="/data/scene5_garden.json"
	ondata={onData}
	onprogress={onProgress}
>
	{#snippet prose({ data })}
		<h2>One garden</h2>
		<p>
			This scene is an illustration, not a measurement — a diagram of a well-understood mechanism,
			so the record's numbers land on something human. Kaukau (sweet potato) is the staple of the
			Papua New Guinea Highlands, grown on mounded gardens up to and past 2,200 metres. On a clear,
			dry, windless night the ground radiates the day's heat straight up to space and can cool far
			below the air a few metres above it; by dawn a garden that normally never freezes can be
			frosted. One such night kills the vines. The tubers below survive, but with the canopy dead
			little feeds them — and because the cuttings needed to replant die in the same frost, the
			loss reaches into the next season. The people who garden here read the coming cold in fog,
			leaf and creek; satellites read the same conditions from orbit. Neither list replaces the
			other.
		</p>
		{#if data?.indicators}
			<table>
				<caption>Two ways of reading the same warning (illustrative)</caption>
				<thead>
					<tr><th scope="col">What the garden shows</th><th scope="col">What an instrument shows</th></tr>
				</thead>
				<tbody>
					{#each data.indicators as pair, i (i)}
						<tr><td>{pair.traditional}</td><td>{pair.satellite}</td></tr>
					{/each}
				</tbody>
			</table>
		{/if}
	{/snippet}

	{#snippet children({ progress, active, data })}
		{@const night = clamp01(progress / NIGHT_END)}
		{@const frost = clamp01((progress - FROST_START) / FROST_SPAN)}
		{@const frosted = frost >= 0.5}
		{@const temps = data?.phase?.night_temps_c ?? [11, -3]}
		{@const temp = temps[Math.min(temps.length - 1, Math.floor(clamp01(progress / TEMP_SPAN) * temps.length))]}
		<div class="garden">
			<div class="copy-col">
				<p class="kicker">Above 2,200 metres · one illustrated night</p>
				<SceneSteps {steps} {progress} width="24rem" />
			</div>

			<div class="stage" class:night={night > 0.6}>
				{#if Mound}
					<Mound {night} {frost} />
				{/if}

				<!-- frost-crystal creep, clipped to the mound area -->
				<div class="frost-region">
					<FrostCanvas {progress} {active} start={FROST_START} span={FROST_SPAN} />
				</div>

				<!-- temperature readout: the scene's clock (schematic) -->
				<div class="temp-readout" class:freezing={temp <= (data?.phase?.frost_threshold_c ?? 0)}>
					<span class="temp-label">{data?.phase?.elevation_m ?? 2300} m · air (illustrative)</span>
					<span class="temp-val">{temp > 0 ? '+' : ''}{temp} °C</span>
				</div>

				<!-- pop-up-book hotspots (optional enrichment, both phases) -->
				{#if data?.hotspots}
					{#each data.hotspots as h (h.id)}
						{@const pos = HS_POS[h.id]}
						{@const copy = frosted ? h.frosted : h.healthy}
						{#if pos}
							<Hotspot id="hs-{h.id}" x={pos.x} y={pos.y} label={h.label} group={hsGroup} {pulse}>
								<h3>{copy.title}</h3>
								<p>{copy.body}</p>
							</Hotspot>
						{/if}
					{/each}
				{/if}

				<p class="sr-only">
					Illustrated cross-section of a kaukau mound: night falls, the temperature drops below
					freezing, frost overtakes the vines and the soil surface cracks.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.garden {
		height: 100%;
		max-width: 76rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem;
		display: grid;
		grid-template-columns: minmax(15rem, 24rem) minmax(0, 1fr);
		gap: 2rem;
		align-items: center;
	}

	.copy-col {
		align-self: start;
		padding-top: 8vh;
	}

	.stage {
		position: relative;
		aspect-ratio: 10 / 7;
		max-height: 82vh;
		width: 100%;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 12px 44px rgba(0, 0, 0, 0.18);
	}

	.frost-region {
		position: absolute;
		left: 16%;
		right: 16%;
		top: 40%;
		bottom: 30%;
		pointer-events: none;
	}

	.temp-readout {
		position: absolute;
		top: 0.9rem;
		left: 0.9rem;
		display: flex;
		flex-direction: column;
		padding: 0.45rem 0.7rem;
		border-radius: 8px;
		background: rgba(6, 10, 18, 0.55);
		color: #f4f2ec;
		backdrop-filter: blur(3px);
		transition: color 0.4s;
	}

	.temp-label {
		font-size: 0.6rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		opacity: 0.75;
	}

	.temp-val {
		font-family: Fraunces, Georgia, serif;
		font-weight: 900;
		font-size: 1.35rem;
		font-variant-numeric: tabular-nums;
	}

	.temp-readout.freezing .temp-val {
		color: #a8d4f8; /* the anomaly scale's cool pole */
	}

	@media (max-width: 800px) {
		.garden {
			grid-template-columns: 1fr;
			gap: 0.75rem;
			align-content: start;
			padding-top: 1rem;
		}

		.copy-col {
			padding-top: 0;
			min-height: 9.5rem;
		}

		.stage {
			max-height: 52vh;
			aspect-ratio: 10 / 7;
		}
	}
</style>
