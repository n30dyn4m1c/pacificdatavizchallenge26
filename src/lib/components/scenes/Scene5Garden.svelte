<script>
	/**
	 * Scene 5 — One Garden, rebuilt as a pop-up book. A large layered SVG
	 * cross-section of a kaukau mound at ~2,300 m (MoundIllustration,
	 * lazy-loaded) with two scroll phases: night falls (sky darkens, the
	 * temperature readout drops) and, once the readout crosses the frost
	 * threshold, the frost lands (crystal creep + leaf burn + soil cracks).
	 *
	 * Five <Hotspot> dots carry phase-appropriate enrichment; the steps
	 * alone tell the complete story — every hotspot is optional.
	 */
	import { onDestroy } from 'svelte';
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import Hotspot from '$lib/components/beats/Hotspot.svelte';
	import Cite from '$lib/components/Cite.svelte';
	import FrostCanvas from './FrostCanvas.svelte';
	import { lag } from '$lib/state.svelte.js';

	// two of the steps are VERIFIED reporting (the kaukau food-energy share
	// and the June frost at Gembogl) — their copy ships in the scene JSON's
	// `reported` block, authored in prep/manual/reported_copy.json with the
	// sources in _meta. One idea per step, as everywhere.
	let reported = $state(null);
	const steps = $derived([
		{ at: [0.02, 0.075], text: 'This is my mound. Kaukau, at 2,300 metres.' },
		...(reported?.kaukau_energy
			? [{ at: [0.075, 0.135], text: reported.kaukau_energy.text, sub: reported.kaukau_energy.sub }]
			: []),
		{ at: [0.135, 0.19], text: 'I planted it in March, when the ocean was already warm.' },
		{ at: [0.19, 0.24], text: 'The old people were already talking.' },
		{ at: [0.24, 0.32], text: 'Dusk. The sky is clear in every direction.' },
		{ at: [0.32, 0.4], text: 'Clear is the danger.', sub: 'Cloud is a blanket, and tonight there is none.' },
		{ at: [0.4, 0.48], text: 'The day’s heat leaves the ground — straight up, into space.' },
		{ at: [0.48, 0.56], text: 'Watch the number.' },
		{ at: [0.56, 0.625], text: 'By 4 a.m., frost. In a garden too warm for frost.' },
		...(reported?.gembogl_frost
			? [{ at: [0.625, 0.695], text: reported.gembogl_frost.text, sub: reported.gembogl_frost.sub }]
			: []),
		{ at: [0.695, 0.755], text: 'One night. That is all it takes.' },
		{ at: [0.755, 0.82], text: 'The vines are black by noon.', sub: 'The tubers below survived — but nothing feeds them now.' },
		{ at: [0.82, 0.89], text: 'The vines we would cut to replant died in the same hour.', sub: 'The next harvest went with them.' },
		{ at: [0.89, 0.97], text: 'The tanket at the garden edge warned us weeks ago.', sub: 'The ocean warned us months ago. Both were right.' }
	]);

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
	function onData(d) {
		reported = d?.reported ?? null;
		import('./MoundIllustration.svelte').then((m) => (Mound = m.default));
	}

	// ── phase mapping ────────────────────────────────────────────────────
	// night falls over 0 → 0.5; the frost phase begins once the readout
	// crosses the threshold (~0.52) and sweeps to ~0.82
	const NIGHT_END = 0.5;
	const FROST_START = 0.52;
	const FROST_SPAN = 0.3;
	// the readout crosses 0 °C exactly when the frost phase begins:
	// temps index 8 (= 0 °C) lands at 8/12 · TEMP_SPAN = 0.52
	const TEMP_SPAN = 0.78;
	const clamp01 = (v) => Math.max(0, Math.min(1, v));

	// idle invite: hotspots pulse only after ~2 s without scroll movement
	let pulse = $state(false);
	let idleTimer = 0;
	function onProgress(p, active) {
		lag.carried5 = active;
		lag.extra5 = p >= 0.8 ? 1 : 0;
		pulse = false;
		clearTimeout(idleTimer);
		if (active) idleTimer = setTimeout(() => (pulse = true), 2000);
	}
	onDestroy(() => clearTimeout(idleTimer));
</script>

<ScrollScene
	id="5-garden"
	title="One garden — a frost night at 2,300 metres"
	heightVh={900}
	surface="light"
	dataUrl="/data/scene5_garden.json"
	ondata={onData}
	onprogress={onProgress}
>
	{#snippet prose({ data })}
		<h2>One garden</h2>
		<p>
			This is what the numbers land on: one mounded garden of kaukau at 2,300 metres — and kaukau
			is about 43&nbsp;% of all the food energy Papua New Guinea eats{#if data?._meta?.kaukau_energy}<Cite
					href={data._meta.kaukau_energy.source_url}
					label={data._meta.kaukau_energy.source}
				/>{/if}. On a clear dry-season night under El Niño skies there is no cloud blanket, so the
			day’s heat radiates straight upward and by 4 a.m. the ground has frozen at an elevation that
			normally never freezes. This is no longer hypothetical: in June 2026, frost was reported
			covering garden plots at Gembogl, in Chimbu — the frost season opening while the event was
			still strengthening{#if data?._meta?.gembogl_frost}<Cite
					href={data._meta.gembogl_frost.source_url}
					label={data._meta.gembogl_frost.source}
					n={2}
				/>{/if}. One such night kills the vines; the tubers below survive it, but with the canopy
			dead nothing feeds them — and because kaukau takes five to nine months from planting, the
			frost also kills the vines needed to replant. It takes this harvest and the next one. Weeks
			without rain then bake the mounds hard, so even replanting must wait. The people who garden
			here read the warning in fog, leaf and creek — the tanket at the garden edge — and
			satellites read the same story from orbit. Neither list replaces the other.
		</p>
		{#if data}
			<table>
				<caption>Traditional and satellite indicators of the same warning</caption>
				<thead>
					<tr><th scope="col">What the garden says</th><th scope="col">What the satellite says</th></tr>
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
				<p class="kicker">Above 2,200 metres · one night, one garden</p>
				<!-- TODO-VERIFY: Tok Pisin placeholder — prep/manual/tokpisin_strings.json#scene5-opener -->
				<p class="tpi-echo" lang="tpi">Wanpela nait, wanpela gaden.</p>
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

				<!-- temperature readout: the scene's clock -->
				<div class="temp-readout" class:freezing={temp <= (data?.phase?.frost_threshold_c ?? 0)}>
					<span class="temp-label">{data?.phase?.elevation_m ?? 2300} m · air</span>
					<span class="temp-val">{temp > 0 ? '+' : ''}{temp} °C</span>
				</div>

				<!-- pop-up-book hotspots (optional enrichment, both phases) -->
				{#if data?.hotspots}
					{#each data.hotspots as h (h.id)}
						{@const pos = HS_POS[h.id]}
						{@const copy = frosted ? h.frosted : h.healthy}
						{#if pos}
							<Hotspot
								id="hs-{h.id}"
								x={pos.x}
								y={pos.y}
								label={h.label}
								group={hsGroup}
								{pulse}
							>
								<h4>{copy.title}</h4>
								<p>{copy.body}</p>
							</Hotspot>
						{/if}
					{/each}
				{/if}

				<p class="sr-only">
					Illustrated cross-section of a kaukau mound: night falls, the temperature drops
					below freezing, frost overtakes the vines and the soil surface cracks.
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
