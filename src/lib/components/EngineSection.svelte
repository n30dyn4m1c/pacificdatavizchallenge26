<script>
	/**
	 * EngineSection — the engine beneath, in cross-section. A schematic of
	 * the equatorial Pacific drawn sideways: sky above the sea line, ocean
	 * below it, the warm pool as a thick surface layer in the west riding on
	 * a tilted thermocline, the Walker circulation looping through the sky,
	 * and the trade winds drawing the loop's return leg along the surface.
	 *
	 * Four states, tweened (not keyed — every parameter eases to its new
	 * value, so the water visibly SLOSHES rather than cuts):
	 *   0 · normal    — trades pile warmth west; air rises over the pool
	 *                   (rain over Papua New Guinea), sinks over the east
	 *   1 · El Niño   — the trades fail; the pool drains east, the
	 *                   thermocline seesaws down in the east, the rain
	 *                   machine moves to mid-ocean, and over Papua New
	 *                   Guinea the air sinks: the sky closes
	 *   2 · La Niña   — the trades strengthen; the engine over-revs
	 *   3 · the point — the slosh itself is what the index measures
	 *
	 * Everything here is mechanism, not measurement: depths are schematic,
	 * labelled as such on the figure. Geometry is hand-authored SVG; the
	 * thermocline and the warm-layer area are generated from the tweened
	 * parameters each frame, so there is nothing to transition but numbers.
	 */
	import { ink, impact, surfaces } from '$lib/palette.js';
	import { ui } from '$lib/state.svelte.js';
	import { untrack } from 'svelte';

	let { phase = 0, ariaLabel } = $props();

	const inkC = ink.dark;
	const imp = impact.dark;

	const W = 1000;
	const H = 560;
	const SURF = 132; //      y of the sea surface
	const FLOOR = 512; //     y of the drawn seabed
	const WEST_X = 120; //    where the west-Pacific depth anchors
	const EAST_X = 880; //    where the east-Pacific depth anchors
	const M_PER_PX = 1.62; // vertical exaggeration, stated on the figure

	// ── the four states, as numbers ─────────────────────────────────────────
	// west/east: mixed-layer depth (m) · riseX/sinkX: where the Walker cell
	// rises and sinks (px) · trades: +1 easterly … negative = westerly burst
	// · convW/convC: convection strength over the west pool / mid-ocean
	const STATES = [
		{ west: 150, east: 45, riseX: 235, sinkX: 700, trades: 1, convW: 1, convC: 0 },
		{ west: 80, east: 150, riseX: 585, sinkX: 205, trades: -0.45, convW: 0.08, convC: 0.92 },
		{ west: 178, east: 32, riseX: 185, sinkX: 745, trades: 1.65, convW: 1, convC: 0 },
		{ west: 150, east: 45, riseX: 235, sinkX: 700, trades: 1, convW: 1, convC: 0 }
	];

	// ── tween machinery: current values ease toward the active state ────────
	let cur = $state({ ...STATES[0] });
	let raf = 0;

	function apply(s) {
		cur.west = s.west;
		cur.east = s.east;
		cur.riseX = s.riseX;
		cur.sinkX = s.sinkX;
		cur.trades = s.trades;
		cur.convW = s.convW;
		cur.convC = s.convC;
	}

	$effect(() => {
		const target = STATES[phase] ?? STATES[0];
		if (ui.reducedMotion) {
			cancelAnimationFrame(raf);
			raf = 0;
			apply(target);
			return;
		}
		// untrack the read of `cur`: the effect must depend on the STATE and on
		// reduced-motion only — writing cur.* each frame must not re-arm it
		const from = untrack(() => ({ ...cur }));
		const t0 = performance.now();
		const DUR = 850;
		const ease = (t) => 1 - Math.pow(1 - t, 3);
		cancelAnimationFrame(raf);
		const step = (now) => {
			const k = ease(Math.min(1, (now - t0) / DUR));
			for (const key in target) from[key] = from[key] + (target[key] - from[key]) * k;
			cur.west = from.west;
			cur.east = from.east;
			cur.riseX = from.riseX;
			cur.sinkX = from.sinkX;
			cur.trades = from.trades;
			cur.convW = from.convW;
			cur.convC = from.convC;
			if (k < 1) raf = requestAnimationFrame(step);
			else raf = 0;
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	});

	// ── derived geometry ────────────────────────────────────────────────────
	const yOf = (depthM) => Math.min(FLOOR - 14, SURF + depthM * M_PER_PX);

	/** mixed-layer depth at x, eased between the west and east anchors */
	const depthAt = (x) => {
		const t = Math.max(0, Math.min(1, (x - WEST_X) / (EAST_X - WEST_X)));
		const s = t * t * (3 - 2 * t); // smoothstep — the tilt reads as a see-saw
		return cur.west + (cur.east - cur.west) * s;
	};

	const SAMPLES = Array.from({ length: 25 }, (_, i) => WEST_X - 60 + ((EAST_X - WEST_X + 120) * i) / 24);

	/** the thermocline, as an SVG path string */
	const thermoPath = $derived(
		SAMPLES.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${yOf(depthAt(x)).toFixed(1)}`).join('')
	);

	/** the warm layer: surface line down to the thermocline */
	const warmPath = $derived(
		`${SAMPLES.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${SURF}`).join('')} L${SAMPLES[
			SAMPLES.length - 1
		].toFixed(1)} ${yOf(depthAt(SAMPLES[SAMPLES.length - 1])).toFixed(1)} ` +
			SAMPLES.slice()
				.reverse()
				.map((x) => `L${x.toFixed(1)} ${yOf(depthAt(x)).toFixed(1)}`)
				.join('') +
			' Z'
	);

	// trade winds: three arrows along the surface, flipping with sign(strength)
	const WIND_XS = [330, 500, 668];
	const windLen = $derived(30 + Math.abs(cur.trades) * 30);
	// base arrow points west (the normal, east→west trades); a negative
	// strength — El Niño's westerly bursts — mirrors it to point east
	const windDir = $derived(cur.trades >= 0 ? 1 : -1);

	// convection: clouds + rain over whichever branch is rising
	const clouds = $derived.by(() => {
		const out = [];
		if (cur.convW > 0.06)
			out.push({ x: cur.riseX, k: cur.convW, dy: -18 });
		if (cur.convC > 0.06)
			out.push({ x: Math.min(Math.max(cur.riseX + 60, 420), 820), k: cur.convC, dy: -18 });
		return out;
	});

	// the walker loop's corners move with riseX / sinkX
	const cellTop = 46;
	const cell = $derived.by(() => {
		const rx = cur.riseX;
		const sx = cur.sinkX;
		return {
			rise: `M${rx} ${SURF - 10} L${rx} ${cellTop}`,
			aloft: `M${rx} ${cellTop} L${sx} ${cellTop}`,
			sink: `M${sx} ${cellTop} L${sx} ${SURF - 10}`
		};
	});

	const fmtDepth = (m) => `${Math.round(m)} m`;
</script>

<div class="wrap">
	<svg viewBox="0 0 {W} {H}" role="img" aria-label={ariaLabel}>
		<defs>
			<!-- ocean body -->
			<linearGradient id="eng-sea" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#0e1930" />
				<stop offset="100%" stop-color="#05070d" />
			</linearGradient>
			<!-- the warm layer: the anomaly scale's warm arm, fading with depth -->
			<linearGradient id="eng-warm" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={imp.drought} stop-opacity="0.52" />
				<stop offset="72%" stop-color={imp.drought} stop-opacity="0.20" />
				<stop offset="100%" stop-color={imp.drought} stop-opacity="0.04" />
			</linearGradient>
			<!-- the cold tongue below the eastern thermocline -->
			<linearGradient id="eng-cold" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#12374f" stop-opacity="0.85" />
				<stop offset="100%" stop-color="#05070d" stop-opacity="0" />
			</linearGradient>
			<marker id="eng-arrow" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
				<path d="M0 0L10 5L0 10z" fill={inkC.primary} />
			</marker>
			<marker id="eng-arrow-cool" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
				<path d="M0 0L10 5L0 10z" fill={imp.frost} />
			</marker>
			<marker id="eng-arrow-warm" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
				<path d="M0 0L10 5L0 10z" fill={imp.drought} />
			</marker>
		</defs>

		<!-- sky -->
		<rect x="0" y="0" width={W} height={SURF} fill="#0a1120" />
		<!-- ocean body -->
		<rect x="0" y={SURF} width={W} height={H - SURF} fill="url(#eng-sea)" />

		<!-- stars: the highland reader's clear night sky, faint -->
		<g fill={inkC.muted} opacity="0.5">
			<circle cx="64" cy="26" r="1.1" /><circle cx="150" cy="54" r="0.9" />
			<circle cx="238" cy="20" r="1.2" /><circle cx="332" cy="44" r="0.8" />
			<circle cx="428" cy="24" r="1" /><circle cx="522" cy="56" r="0.9" />
			<circle cx="618" cy="28" r="1.1" /><circle cx="714" cy="50" r="0.8" />
			<circle cx="806" cy="22" r="1" /><circle cx="900" cy="46" r="0.9" />
			<circle cx="962" cy="24" r="1.1" />
		</g>

		<!-- land silhouettes, for orientation -->
		<g>
			<!-- Papua New Guinea, west edge -->
			<path
				d="M0 {SURF - 46} L34 {SURF - 52} L58 {SURF - 40} L84 {SURF - 46} L104 {SURF - 34}
				   L118 {SURF - 36} L128 {SURF} L0 {SURF} Z"
				fill={inkC.grid}
				stroke={inkC.axis}
				stroke-width="1"
			/>
			<text x="10" y={SURF - 56} font-size="13" font-weight="800" fill={inkC.primary}>Papua New Guinea</text>
			<!-- South America, east edge -->
			<path
				d="M{W} {SURF - 40} L{W - 46} {SURF - 34} L{W - 70} {SURF - 22} L{W - 78} {SURF} L{W} {SURF} Z"
				fill={inkC.grid}
				stroke={inkC.axis}
				stroke-width="1"
			/>
			<text x={W - 12} y={SURF - 46} text-anchor="end" font-size="12" font-weight="600" fill={inkC.secondary}>South America</text>
		</g>

		<!-- the cold water that surfaces in the east when the thermocline is shallow -->
		<path
			d={`M${WEST_X - 60} ${FLOOR} L${WEST_X - 60} ${yOf(depthAt(WEST_X - 60)).toFixed(1)} ${SAMPLES
				.filter((x) => x >= WEST_X)
				.map((x) => `L${x.toFixed(1)} ${Math.min(FLOOR, yOf(depthAt(x)) + 26).toFixed(1)}`)
				.join('')} L${EAST_X + 60} ${FLOOR} Z`}
			fill="url(#eng-cold)"
			class="soft"
		/>

		<!-- THE WARM LAYER -->
		<path d={warmPath} fill="url(#eng-warm)" class="soft" />

		<!-- THE THERMOCLINE — the story's second protagonist -->
		<path d={thermoPath} fill="none" stroke={imp.frost} stroke-width="2.4" stroke-linecap="round" opacity="0.95" class="soft" />

		<!-- depth ruler -->
		<g font-size="11" fill={inkC.muted}>
			{#each [0, 50, 100, 150, 200] as d (d)}
				<line x1="36" x2="44" y1={yOf(d)} y2={yOf(d)} stroke={inkC.axis} stroke-width="1" />
				<text x="30" y={yOf(d) + 3.5} text-anchor="end">{d}</text>
			{/each}
			<text x="48" y={yOf(200) + 22} text-anchor="start">metres</text>
		</g>

		<!-- sea surface -->
		<line x1="0" x2={W} y1={SURF} y2={SURF} stroke={inkC.axis} stroke-width="1.6" />

		<!-- ── the Walker circulation, looping through the sky ──────────────── -->
		<g fill="none" stroke-linecap="round">
			<!-- rising branch: where the air (and the rain) goes UP -->
			<path d={cell.rise} stroke={imp.frost} stroke-width="2.6" marker-end="url(#eng-arrow-cool)"
				opacity={Math.max(cur.convW, cur.convC)} class="soft" />
			<!-- aloft: poleward flow -->
			<path d={cell.aloft} stroke={inkC.secondary} stroke-width="1.8" marker-end="url(#eng-arrow)"
				opacity="0.75" stroke-dasharray="1 7" class="soft" />
			<!-- sinking branch: where the sky closes -->
			<path d={cell.sink} stroke={imp.drought} stroke-width="2.6" marker-end="url(#eng-arrow-warm)"
				opacity="0.9" class="soft" />
		</g>

		<!-- clouds + rain ride the rising branch. Outer group positions, inner
		     group drifts — a CSS transform would override the positioning
		     attribute if they shared one element. -->
		{#each clouds as c, i (i)}
			<g class="soft" style:opacity="{0.25 + 0.75 * c.k}">
				<g transform="translate({c.x} {SURF + c.dy})">
					<g class="cloud-drift">
						<ellipse cx="-16" cy="-6" rx="15" ry="7.5" fill={inkC.secondary} />
						<ellipse cx="2" cy="-10" rx="18" ry="9" fill={inkC.secondary} />
						<ellipse cx="17" cy="-5" rx="13" ry="6.5" fill={inkC.secondary} />
						<g stroke={imp.frost} stroke-width="2" stroke-linecap="round">
							{#each [-18, -8, 2, 12] as dx (dx)}
								<line x1={dx} y1="6" x2={dx - 3} y2="16" opacity="0.85" />
							{/each}
						</g>
					</g>
				</g>
			</g>
		{/each}

		<!-- ── the trade winds: the return leg, drawn along the surface ─────── -->
		<g class="soft">
			{#each WIND_XS as wx, i (wx)}
				<g transform="translate({wx} {SURF - 22})">
					<g style:transform="scaleX({windDir})">
						<line
							x1={windLen / 2}
							x2={-windLen / 2}
							stroke={cur.trades >= 0 ? inkC.primary : imp.drought}
							stroke-width="2.4"
							marker-end={cur.trades >= 0 ? 'url(#eng-arrow)' : 'url(#eng-arrow-warm)'}
						/>
					</g>
				</g>
			{/each}
			<text
				x={500}
				y={SURF - 42}
				text-anchor="middle"
				font-size="13"
				font-weight="700"
				fill={cur.trades >= 0 ? inkC.primary : imp.drought}
			>{cur.trades >= 0 ? 'the trade winds, blowing east → west' : 'the trades fail — westerly bursts'}</text>
		</g>

		<!-- annotations that belong to specific states -->
		{#if phase === 0 || phase === 3}
			<g class="soft">
				<text x={cur.riseX} y={cellTop - 12} text-anchor="middle" font-size="13.5" font-weight="700" fill={imp.frost}>air rises — daily rain</text>
				<text x={cur.sinkX + 8} y={SURF - 62} font-size="13.5" font-weight="600" fill={imp.drought}>air sinks — clear, dry</text>
				<!-- the pool's name sits inside the warm layer, over its deepest part -->
				<text x={Math.max(cur.riseX + 70, 250)} y={yOf(cur.west * 0.42) + 40} font-size="14" font-weight="700" fill={inkC.primary}>the warm pool</text>
				<text x={Math.max(cur.riseX + 70, 250)} y={yOf(cur.west * 0.42) + 56} font-size="12" fill={inkC.secondary}>sun-heated, storm-bearing</text>
			</g>
		{/if}
		{#if phase === 1}
			<g class="soft">
				<text x={cur.riseX} y={cellTop - 12} text-anchor="middle" font-size="13.5" font-weight="700" fill={imp.frost}>the rain machine, gone east</text>
				<!-- above the aloft line, in the empty sky west of the rain machine -->
				<text x={cur.sinkX + 12} y={cellTop - 14} text-anchor="start" font-size="13.5" font-weight="700" fill={imp.drought}>over PNG: air sinks — the sky closes</text>
				<text x={770} y={yOf(cur.east * 0.55)} text-anchor="middle" font-size="13.5" font-weight="700" fill={inkC.primary}>the warm layer slides east</text>
				<text x={250} y={yOf(cur.west * 0.6) + 40} font-size="13" font-weight="600" fill={inkC.secondary}>upwelling stops</text>
			</g>
		{/if}
		{#if phase === 2}
			<g class="soft">
				<text x={cur.riseX} y={cellTop - 12} text-anchor="middle" font-size="13.5" font-weight="700" fill={imp.frost}>rising harder than ever — flood rain</text>
				<text x={cur.sinkX + 8} y={SURF - 62} font-size="13.5" font-weight="600" fill={imp.drought}>sinking east — bone dry there</text>
			</g>
		{/if}

		<!-- the thermocline's name, tracking its west anchor -->
		<text
			x={WEST_X + 6}
			y={yOf(cur.west) + 22}
			font-size="13"
			font-weight="700"
			fill={imp.frost}
			class="soft"
		>the thermocline — {fmtDepth(cur.west)} in the west</text>
		<text
			x={EAST_X}
			y={yOf(cur.east) + 22}
			text-anchor="end"
			font-size="13"
			font-weight="700"
			fill={imp.frost}
			class="soft"
		>{fmtDepth(cur.east)} in the east</text>

		<!-- Niño 3.4, measured at the surface of the east -->
		<g>
			<line x1="762" x2="762" y1={SURF} y2={yOf(cur.east) - 6} stroke={inkC.axis} stroke-dasharray="3 4" />
			<rect x="756" y={SURF - 8} width="150" height="16" fill="none" stroke={inkC.secondary} stroke-dasharray="5 4" rx="3" />
			<text x="831" y={SURF + 26} text-anchor="middle" font-size="11.5" font-weight="700" fill={inkC.secondary}>Niño 3.4 — measured here</text>
		</g>
	</svg>
</div>

<style>
	.wrap {
		width: 100%;
		height: 100%;
		display: flex;
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	/* shapes are re-generated every tween frame — the numbers carry the
	   motion, so only discrete fades get a CSS transition here */
	.soft {
		transition: opacity 0.5s ease;
	}

	.cloud-drift {
		animation: drift 7s ease-in-out infinite alternate;
	}

	@keyframes drift {
		from {
			transform: translate(-7px, 0);
		}
		to {
			transform: translate(7px, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.soft {
			transition: none;
		}

		.cloud-drift {
			animation: none;
		}
	}
</style>
