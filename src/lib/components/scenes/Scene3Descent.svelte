<script>
	/**
	 * Scene 3 — The Descent. A wide SVG elevation transect (Coral Sea →
	 * Fly River lowlands → Highlands ~2,800 m), panned by scroll progress.
	 * From here on, elevation is the piece's organizing axis.
	 */
	import { scaleLinear } from 'd3-scale';
	import { area as d3area, line as d3line, curveBasis } from 'd3-shape';
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import TapReveal from '$lib/components/beats/TapReveal.svelte';
	import { ink } from '$lib/palette.js';

	// windows track the pan: the viewport centre is in the lowlands until
	// ~0.45, the foothills until ~0.8, the high valleys after
	const steps = [
		{ at: [0.02, 0.12], text: 'Leave the coast with me and head inland.' },
		{ at: [0.12, 0.26], text: 'First, the Fly River lowlands — barely above the tide.' },
		{ at: [0.26, 0.42], text: 'Out here, rivers are the roads.' },
		{ at: [0.42, 0.62], text: 'Now climb, into the valleys where the kaukau grows.' },
		{ at: [0.62, 0.78], text: 'Higher. Past 2,200 metres the gardens enter frost country.' },
		{ at: [0.78, 0.9], text: 'Up here, one clear night is all it takes.' },
		{ at: [0.9, 1], text: 'Elevation decides which disaster finds you.' }
	];

	const inkC = ink.dark;

	// world coordinates: 2400 wide, 760 tall; the viewport pans across it
	const WORLD = 2400;
	const WIN = 900;
	const HW = 760;
	// vertical range stays inside the band that survives xMidYMid slice
	// cropping on wide viewports (~y 100–660 of the 760-unit world)
	const xKm = scaleLinear([-80, 560], [0, WORLD]);
	const yEl = scaleLinear([-200, 3100], [640, 170]);

	const landArea = (profile) =>
		d3area()
			.x((d) => xKm(d.km))
			.y0(HW)
			.y1((d) => yEl(d.elev))
			.curve(curveBasis)(profile);

	const landLine = (profile) =>
		d3line()
			.x((d) => xKm(d.km))
			.y((d) => yEl(d.elev))
			.curve(curveBasis)(profile);

	const contours = [
		{ elev: 0, label: 'sea level' },
		{ elev: 1400, label: '1,400 m' },
		{ elev: 2200, label: '2,200 m — the frost line begins' },
		{ elev: 2800, label: '2,800 m — the highest gardens' }
	];

	// current elevation under the viewport centre, for the HUD readout
	function elevAt(profile, p) {
		const kmCenter = xKm.invert(p * (WORLD - WIN) + WIN / 2);
		let best = profile[0];
		for (const d of profile) if (Math.abs(d.km - kmCenter) < Math.abs(best.km - kmCenter)) best = d;
		return best.elev;
	}
</script>

<ScrollScene
	id="3-descent"
	title="Elevation transect from the Coral Sea to the Highlands"
	heightVh={680}
	surface="dark"
	dataUrl="/data/scene3_transect.json"
>
	{#snippet prose()}
		<h2>The descent — or rather, the climb</h2>
		<p>
			Leave the Coral Sea and travel inland: first the Fly River lowlands, a floodplain barely
			above the tide, where rivers are the roads and sago and gardens sit on the levees. Then the
			foothills, then the great highland valleys at 1,400–2,200 metres where most of the nation’s
			sweet potato — kaukau — is grown. Above 2,200 metres the gardens climb into frost country:
			one clear, dry El Niño night is all it takes. Elevation decides which disaster finds you.
		</p>
	{/snippet}

	{#snippet children({ progress, data })}
		{#if data}
			{@const vx = progress * (WORLD - WIN)}
			<div class="stage">
				<svg
					viewBox="{vx} 0 {WIN} {HW}"
					preserveAspectRatio="xMidYMid slice"
					class="chart"
					role="img"
					aria-label="Panning elevation profile from the Coral Sea across the Fly River lowlands and up to highland gardens near 2,800 metres"
				>
					<defs>
						<linearGradient id="landfill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stop-color="#232f45" />
							<stop offset="1" stop-color="#0b1120" />
						</linearGradient>
						<linearGradient id="seafill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stop-color="#12335c" />
							<stop offset="1" stop-color="#081527" />
						</linearGradient>
					</defs>
					<!-- sea -->
					<rect x="0" y={yEl(0)} width={xKm(20)} height={HW - yEl(0)} fill="url(#seafill)" />
					<!-- elevation contour guides (labels hug the right edge, clear
					     of the step column on the left) -->
					{#each contours as c (c.elev)}
						<line x1="0" x2={WORLD} y1={yEl(c.elev)} y2={yEl(c.elev)} stroke={inkC.grid} stroke-dasharray="2 6" />
						<text x={vx + WIN - 16} y={yEl(c.elev) - 8} text-anchor="end" font-size="13" fill={inkC.muted}>
							{c.label}
						</text>
					{/each}
					<!-- land -->
					<path d={landArea(data.profile)} fill="url(#landfill)" />
					<path d={landLine(data.profile)} fill="none" stroke="#4d5a72" stroke-width="2.5" />
					<!-- band annotations -->
					{#each data.bands as b (b.band)}
						{@const bx = xKm(b.km)}
						{@const by = yEl(b.elev)}
						<g opacity={Math.abs(bx - (vx + WIN / 2)) < WIN * 0.55 ? 1 : 0} style="transition: opacity 0.4s">
							<line x1={bx} x2={bx} y1={by - 14} y2={by - 92} stroke={inkC.muted} />
							<circle cx={bx} cy={by - 10} r="4" fill={inkC.secondary} />
							<text x={bx + 10} y={by - 96} font-size="15" font-weight="600" fill={inkC.primary}>
								{b.label.split(' — ')[0]}
							</text>
							{#if b.label.includes(' — ')}
								<text x={bx + 10} y={by - 76} font-size="13" fill={inkC.secondary}>
									{b.label.split(' — ')[1]}
								</text>
							{/if}
						</g>
					{/each}
				</svg>

				<div class="hud">
					<span class="kicker">travelling inland</span>
					<span class="elev display">
						{elevAt(data.profile, progress) < 0
							? 'open water'
							: `≈ ${Math.round(elevAt(data.profile, progress) / 10) * 10} m`}
					</span>
				</div>

				<div class="steps-anchor">
					<SceneSteps {steps} {progress} width="26rem" />
					<!-- inert while faded out, so the invisible button is never focusable -->
					<div class="reveal-slot" class:hidden={progress <= 0.42} inert={progress <= 0.42}>
						<TapReveal id="s3-crops" label="What grows where →">
							<h4>Three gardens, three altitudes</h4>
							<p>
								On the floodplain: sago from the swamps, bananas and gardens on the river
								levees — fed by the river, starved when it drops.
							</p>
							<p>
								In the valleys between 1,400 and 2,200 metres: the kaukau belt, the staple
								food of the Highlands, mounded on every slope.
							</p>
							<p>
								Above 2,200 metres: the highest gardens push kaukau to its cold limit. They
								feed the ridgetop settlements — and they are first in line when a clear
								night comes.
							</p>
						</TapReveal>
					</div>
				</div>
			</div>
		{/if}
	{/snippet}
</ScrollScene>

<style>
	.stage {
		position: relative;
		height: 100%;
	}

	svg {
		width: 100%;
		height: 100%;
		display: block;
	}

	.hud {
		position: absolute;
		right: 1.5rem;
		bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		text-align: right;
	}

	.elev {
		font-size: clamp(1.6rem, 5vw, 2.6rem);
		font-weight: 900;
		font-variant-numeric: tabular-nums;
	}

	.steps-anchor {
		position: absolute;
		left: clamp(1.25rem, 5vw, 4rem);
		top: 16vh;
		right: 6rem;
	}

	.steps-anchor :global(.step-text) {
		text-shadow: 0 1px 16px rgba(0, 0, 0, 0.7);
	}

	.reveal-slot {
		margin-top: 0.75rem;
		transition: opacity 0.4s;
	}

	.reveal-slot.hidden {
		opacity: 0;
		pointer-events: none;
	}
</style>
