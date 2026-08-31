<script>
	/**
	 * NinoMonths — chapter nine's sticky graphic, at monthly resolution.
	 * Two views crossfade under the step cards:
	 *
	 *  · phase 0 — "recent": one diverging bar per month, Jan 2023 → the last
	 *    observation. The 2023–24 El Niño, the shallow double-dip La Niña of
	 *    2024–25, and the fast flip of early 2026, in the two meaning colors.
	 *  · phase 1+ — "aligned": the four great El Niños laid over each other by
	 *    calendar month (Jan of the onset year → Jun of the year after) as
	 *    ghost lines with direct labels at their peaks; 2026 so far is the
	 *    accent line. phase 2 adds the analogue estimate — a min–max envelope
	 *    of the four precedents plus a similarity-weighted dashed mean,
	 *    labelled as an estimate on the graphic (dashes mean projection,
	 *    nowhere else in the piece). phase 3 marks the estimate's homework: the
	 *    gap between what it expected for the latest month and what was
	 *    actually read, plus the anchored path (the same four trajectories
	 *    started from 2026's own level). phase 4 adds the two timing brackets
	 *    (the hard months / the swing back).
	 *
	 * From phase 1 a single hollow marker carries the latest *cited* reading —
	 * the CPC weekly index, a different product on a different SST basis. It is
	 * deliberately drawn as an unconnected ringed point rather than as part of
	 * the line, and says so in its own label and in the legend, because the one
	 * thing this chart must never do is imply that a quoted weekly number is a
	 * measurement in the monthly series it draws.
	 *
	 * The vertical scale is derived from everything drawn, not hard-coded: an
	 * event that verifies above its own precedents must never clip against the
	 * top of the chart that is arguing it is running hot.
	 *
	 * Data: static/data/scene_now.json (NOAA PSL Niño 3.4 monthly; the
	 * estimate is computed by /prep, never here).
	 */
	import { scaleLinear } from 'd3-scale';
	import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
	import { ink, impact, series as seriesColors, surfaces } from '$lib/palette.js';

	let {
		data, //           scene_now.json
		phase = 0, //      0 recent · 1 aligned · 2 +estimate · 3 +scoring · 4 +timing
		progress = 1, //   0–1 draw-in within the current phase
		mode = 'light',
		height = 470,
		ariaLabel
	} = $props();

	let w = $state(720);
	const W = $derived(Math.max(w, 300));
	// below this the plot is too small to carry secondary on-chart labels; they
	// move into the legend rather than piling up on the lines
	const narrow = $derived(W < 560);
	// On a phone the pin is split vertically and this chart gets a band a couple
	// of hundred pixels tall — so the margins stop paying for themselves. The
	// wide layout's right margin exists only to hold the threshold caption; on
	// narrow that caption moves to the legend and the margin goes back to the
	// plot, along with the room the (also relocated) top captions were using.
	const PAD = $derived(
		narrow ? { l: 32, r: 16, t: 26, b: 62 } : { l: 46, r: 104, t: 58, b: 66 }
	);

	const inkC = $derived(ink[mode]);
	const imp = $derived(impact[mode]);
	const colors = $derived(seriesColors[mode]);
	const surface = $derived(mode === 'light' ? surfaces.paper : surfaces.ocean);

	const aligned = $derived(phase >= 1);
	const frac = $derived(Math.max(0, Math.min(1, progress)));

	// one shared y scale across both views, so the crossfade keeps its ground —
	// and derived from every mark either view draws, so nothing can clip
	const yDomain = $derived.by(() => {
		const v = [];
		for (const d of data?.recent ?? []) v.push(d.anomaly);
		for (const ev of data?.events ?? []) for (const d of ev.months) v.push(d.anomaly);
		for (const d of data?.current?.months ?? []) v.push(d.anomaly);
		for (const d of data?.analogue?.forecast ?? []) v.push(d.lo, d.hi);
		// the anchored path is drawn as a line, so only its mean can clip
		for (const d of data?.analogue?.anchored ?? []) v.push(d.mean);
		if (data?.latest_reading) v.push(data.latest_reading.anomaly);
		if (!v.length) return [-1, 3];
		// pad, generously at the top where the peak labels live, then round out
		// to a half degree so the gridline story stays stable between rebuilds
		const out = (x, s) => (x < 0 ? Math.floor(x / s) : Math.ceil(x / s)) * s;
		return [
			Math.min(out(Math.min(...v) - 0.25, 0.5), -0.5),
			Math.max(out(Math.max(...v) + 0.55, 0.5), 1)
		];
	});
	// the legend is part of the figure's measured body, so the drawing surface
	// is what is left after it — otherwise a legend that wraps to four lines on
	// a phone pushes itself out of the body and over the figure's foot
	let legendH = $state(26);
	const svgH = $derived(Math.max(150, height - legendH - 6));
	const y = $derived(scaleLinear(yDomain, [svgH - PAD.b, PAD.t]));
	// whole-degree gridline labels inside whatever domain we ended up with
	const yTicks = $derived.by(() => {
		const out = [];
		for (let t = Math.ceil(yDomain[0]); t <= Math.floor(yDomain[1]); t++) if (t !== 0) out.push(t);
		return out;
	});

	// ── recent view: monthly bars, Jan 2023 → now ────────────────────────────
	const recent = $derived(data?.recent ?? []);
	const xR = $derived(scaleLinear([0, Math.max(recent.length - 1, 1)], [PAD.l, W - PAD.r]));
	const bw = $derived(Math.max(3, ((W - PAD.l - PAD.r) / Math.max(recent.length, 1)) * 0.62));
	const janTicks = $derived(
		recent.map((d, i) => ({ ...d, i })).filter((d) => d.date.endsWith('-01'))
	);
	// the three phase annotations, anchored to each phase's extreme month
	const annR = $derived.by(() => {
		if (!recent.length) return [];
		const idx = (date) => recent.findIndex((d) => d.date === date);
		const seg = (a, b) => recent.map((d, i) => ({ ...d, i })).slice(idx(a), idx(b) + 1);
		const maxIn = (rows) => rows.reduce((p, d) => (d.anomaly > p.anomaly ? d : p));
		const minIn = (rows) => rows.reduce((p, d) => (d.anomaly < p.anomaly ? d : p));
		const elnino = maxIn(seg('2023-01', '2024-04'));
		const lanina = minIn(seg('2024-05', '2026-01'));
		const now = recent.at(-1);
		return [
			{ i: elnino.i, y: y(elnino.anomaly) - 10, text: 'El Niño 2023–24', color: imp.drought },
			{
				i: lanina.i,
				// normally under its own trough; on narrow the tick row is right
				// there, so it goes into the empty positive field above instead
				y: narrow ? y(0) - 12 : y(lanina.anomaly) + 28,
				text: 'La Niña, twice — weak',
				color: imp.frost
			},
			{ i: recent.length - 1, y: y(now.anomaly) - 10, text: 'now', color: imp.drought }
		];
	});

	// ── aligned view: months m = 0..17, Jan onset-year → Jun year+1 ──────────
	const SPAN = $derived(data?.span ?? 18);
	const xA = $derived(scaleLinear([0, SPAN - 1], [PAD.l, W - PAD.r]));
	const genLine = $derived(
		d3line().x((d) => xA(d.m)).y((d) => y(d.anomaly)).curve(curveMonotoneX)
	);
	const genMean = $derived(
		d3line().x((d) => xA(d.m)).y((d) => y(d.mean)).curve(curveMonotoneX)
	);
	// the anchored path starts one month after the last observation, so it is
	// stitched to that point to avoid a floating stub
	const anchoredLine = $derived.by(() => {
		const lastObs = current?.months?.at(-1);
		if (!lastObs || !anchoredPath.length) return null;
		return genMean([{ m: lastObs.m, mean: lastObs.anomaly }, ...anchoredPath]);
	});
	const genBand = $derived(
		d3area().x((d) => xA(d.m)).y0((d) => y(d.lo)).y1((d) => y(d.hi)).curve(curveMonotoneX)
	);

	// direct labels sit at each ghost's peak; hand-set nudges keep the four
	// peak labels (two share the same month) from colliding
	const NUDGE = {
		1982: { dx: -9, dy: 4, anchor: 'end' },
		1997: { dx: -13, dy: 13, anchor: 'end' },
		2015: { dx: 0, dy: -10, anchor: 'middle' },
		2023: { dx: 9, dy: 12, anchor: 'start' }
	};
	const events = $derived(data?.events ?? []);
	const current = $derived(data?.current);
	const fc = $derived(data?.analogue?.forecast ?? []);
	const anchoredPath = $derived(data?.analogue?.anchored ?? []);
	const timing = $derived(data?.timing);
	// the one cited (weekly) reading — marked, never joined to the monthly line
	const latest = $derived(data?.latest_reading);
	// phase 3 scores the estimate — but only where an estimate actually
	// existed, i.e. months beyond the last observation. At the observation's
	// own month the "estimate" is pinned to that very data point, so no honest
	// miss can be drawn there; the cited reading is instead compared against
	// the precedents (`vs_precedents`), which stays meaningful at any month.
	const obsEndM = $derived(current?.latest?.m ?? -1);
	const missAt = $derived(
		latest && latest.m > obsEndM ? fc.find((d) => d.m === latest.m) : null
	);

	const mTicks = $derived.by(() => {
		const names = data?.month_names ?? [];
		const onset = current?.onset ?? 2026;
		const out = [];
		for (let m = 0; m < SPAN; m += W < 560 ? 6 : 3) {
			const mo = names[m % 12];
			out.push({ m, label: m === 0 || m % 12 === 0 ? `${mo} ${onset + Math.floor(m / 12)}` : mo });
		}
		return out;
	});

	// hover readout: nearest month, in whichever view is showing
	let hoverM = $state(null); // aligned view: month m = 0..17
	let hoverR = $state(null); // recent view: index into `recent`
	function onMove(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * W;
		if (!aligned) {
			hoverR = Math.max(0, Math.min(recent.length - 1, Math.round(xR.invert(px))));
			hoverM = null;
			return;
		}
		hoverM = Math.max(0, Math.min(SPAN - 1, Math.round(xA.invert(px))));
		hoverR = null;
	}
	const atM = (rows, m) => rows?.find((d) => d.m === m);
	const fmt = (v) => (v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(2));
	const hoverLabel = $derived.by(() => {
		if (hoverM == null || !data) return null;
		const names = data.month_names;
		const onset = current?.onset ?? 2026;
		return `${names[hoverM % 12]} ${onset + Math.floor(hoverM / 12)}`;
	});
</script>

<div class="wrap" bind:clientWidth={w}>
	<svg
		viewBox="0 0 {W} {svgH}"
		role="img"
		aria-label={ariaLabel}
		onpointermove={onMove}
		onpointerleave={() => {
			hoverM = null;
			hoverR = null;
		}}
	>
		<!-- shared frame: zero line + the El Niño threshold -->
		<line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke={inkC.axis} stroke-width="1.4" />
		<line x1={PAD.l} x2={W - PAD.r} y1={y(0.5)} y2={y(0.5)} stroke={inkC.grid} stroke-width="1" />
		<!-- the threshold caption lives in the right margin, outside the plot: the
		     right edge of the plot is exactly where all four precedents converge
		     on their way down, and it used to be written over by them -->
		{#if !narrow}
			<text x={W - PAD.r + 6} y={y(0.5) - 3} font-size="10" fill={inkC.muted}>+0.5 °C</text>
			<text x={W - PAD.r + 6} y={y(0.5) + 9} font-size="10" fill={inkC.muted}>El Niño threshold</text>
		{/if}
		{#each yTicks as t (t)}
			<text x={PAD.l - 7} y={y(t) + 3.5} text-anchor="end" font-size="10.5" fill={inkC.muted}>
				{t > 0 ? '+' + t : t}
			</text>
		{/each}
		<text x={PAD.l - 7} y={y(0) + 3.5} text-anchor="end" font-size="10.5" fill={inkC.secondary}>0 °C</text>

		<!-- ── view 1: the recent see-saw, in months ─────────────────────────── -->
		<g class="fade" opacity={aligned ? 0 : 1} style:pointer-events="none">
			<!-- the two orientation labels live in the margins the narrow layout
			     gives back to the plot; there, the legend's swatches carry them -->
			{#if !narrow}
				<text x={PAD.l + 2} y={PAD.t - 34} font-size="12.5" font-weight="700" fill={imp.drought}>
					El Niño ↑ warm water drains east
				</text>
				<text x={PAD.l + 2} y={svgH - PAD.b + 40} font-size="12.5" font-weight="700" fill={imp.frost}>
					La Niña ↓ warmth piles back west
				</text>
			{/if}
			{#each recent as d, i (d.date)}
				{@const on = i / Math.max(recent.length - 1, 1) <= (aligned ? 1 : frac) + 0.001}
				<rect
					x={xR(i) - bw / 2}
					y={d.anomaly >= 0 ? y(d.anomaly) : y(0)}
					width={bw}
					height={Math.abs(y(d.anomaly) - y(0))}
					rx="1.5"
					fill={d.anomaly >= 0 ? imp.drought : imp.frost}
					opacity={on ? 0.88 : 0}
					style="transition: opacity 0.25s"
				/>
			{/each}
			{#each janTicks as t (t.date)}
				<text x={xR(t.i)} y={svgH - PAD.b + 22} text-anchor="middle" font-size="11" fill={inkC.muted}>
					{t.date.slice(0, 4)}
				</text>
			{/each}
			{#each annR as a (a.text)}
				<text
					x={Math.min(xR(a.i), W - PAD.r)}
					y={a.y}
					text-anchor={a.i > recent.length - 6 ? 'end' : 'middle'}
					font-size="12"
					font-weight="700"
					fill={a.color}
					paint-order="stroke"
					stroke={surface}
					stroke-width="3.5"
					opacity={frac > 0.15 ? 1 : 0}
					style="transition: opacity 0.4s"
				>{a.text}</text>
			{/each}
			{#if hoverR != null}
				<line x1={xR(hoverR)} x2={xR(hoverR)} y1={PAD.t} y2={svgH - PAD.b} stroke={inkC.axis} />
			{/if}
		</g>

		<!-- ── view 2: the four precedents, 2026, and the estimate ──────────── -->
		<g class="fade" opacity={aligned ? 1 : 0} style:pointer-events="none">
			<!-- the analogue estimate (phase ≥ 2): envelope + dashed weighted mean -->
			<g class="fade" opacity={phase >= 2 ? 1 : 0}>
				<path d={genBand(fc)} fill={colors.accent} opacity="0.11" />
				<path
					d={genMean(fc)}
					fill="none"
					stroke={colors.accent}
					stroke-width="2"
					stroke-dasharray="6 5"
					stroke-linecap="round"
				/>
				<!-- the estimate's own caption, parked in the empty upper-left corner
				     so it never has to share a line with the ghosts' peak labels -->
				{#if timing && !narrow}
					<text
						x={PAD.l + 4}
						y={PAD.t - 22}
						font-size="11.5"
						font-weight="600"
						fill={inkC.secondary}
						paint-order="stroke"
						stroke={surface}
						stroke-width="3.5"
					>estimate — where the four precedents actually ran</text>
					<text
						x={PAD.l + 4}
						y={PAD.t - 8}
						font-size="11.5"
						fill={inkC.muted}
						paint-order="stroke"
						stroke={surface}
						stroke-width="3.5"
					>weighted path peaks ≈ {fmt(timing.peak.mean)} °C · {timing.peak.label}</text>
					{#if latest?.vs_precedents?.above_all && !narrow}
						<text
							x={PAD.l + 4}
							y={PAD.t + 6}
							font-size="11.5"
							font-weight="600"
							fill={imp.drought}
							paint-order="stroke"
							stroke={surface}
							stroke-width="3.5"
						>— and 2026 is running above any precedent at the same point</text>
					{/if}
				{/if}
			</g>

			<!-- phase 3 — marking the estimate's homework, but only where an
			     estimate for the cited month actually existed (beyond the last
			     observation); otherwise only the anchored path shows here -->
			<g class="fade" opacity={phase >= 3 ? 1 : 0}>
				{#if anchoredLine}
					<path
						d={anchoredLine}
						fill="none"
						stroke={colors.accent}
						stroke-width="1.8"
						stroke-dasharray="3 4"
						stroke-linecap="round"
						opacity="0.55"
					/>
					<!-- no direct label: the anchored path runs the width of the chart
					     and every place it ends up is already occupied. The legend
					     names it and card 4 explains it. -->
				{/if}
				{#if missAt && latest}
					<!-- what the estimate allowed for that month… -->
					<line
						x1={xA(latest.m)}
						x2={xA(latest.m)}
						y1={y(missAt.lo)}
						y2={y(missAt.hi)}
						stroke={inkC.secondary}
						stroke-width="2.2"
						stroke-linecap="round"
					/>
					<!-- …and the distance up to what was read -->
					<line
						x1={xA(latest.m)}
						x2={xA(latest.m)}
						y1={y(missAt.hi)}
						y2={y(latest.anomaly)}
						stroke={imp.drought}
						stroke-width="1.6"
						stroke-dasharray="2 3"
					/>
					{#if !narrow}
						<text
							x={xA(latest.m) + 14}
							y={(y(missAt.hi) + y(latest.anomaly)) / 2 + 4}
							text-anchor="start"
							font-size="11"
							font-weight="700"
							fill={imp.drought}
							paint-order="stroke"
							stroke={surface}
							stroke-width="3.5"
						>missed low</text>
						<text
							x={xA(latest.m) - 9}
							y={y(missAt.lo) + 4}
							text-anchor="end"
							font-size="10.5"
							fill={inkC.muted}
							paint-order="stroke"
							stroke={surface}
							stroke-width="3.5"
						>the estimate’s range here</text>
					{/if}
				{/if}
			</g>

			<!-- ghost lines: the four great El Niños, labelled at their peaks -->
			{#each events as ev, i (ev.onset)}
				<path
					d={genLine(ev.months)}
					fill="none"
					stroke={i % 2 ? colors.ghost2 : colors.ghost1}
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
					pathLength="1"
					stroke-dasharray="1"
					stroke-dashoffset={phase >= 2 ? 0 : 1 - frac}
				/>
				{@const n = NUDGE[ev.onset] ?? { dx: 8, dy: 0, anchor: 'start' }}
				<!-- four direct labels need four clear peaks; below 560 px they do not
				     have them, so they hand off to the legend rather than pile up -->
				{#if !narrow}
					<text
						x={xA(ev.peak.m) + n.dx}
						y={y(ev.peak.anomaly) + n.dy}
						text-anchor={n.anchor}
						font-size="11.5"
						font-weight="600"
						fill={inkC.secondary}
						paint-order="stroke"
						stroke={surface}
						stroke-width="3.5"
						opacity={phase >= 2 || frac > 0.6 ? 1 : 0}
						style="transition: opacity 0.4s"
					>{ev.label}</text>
				{/if}
			{/each}

			<!-- 2026 so far: the accent line, ending in the open present -->
			{#if current}
				<path
					d={genLine(current.months)}
					fill="none"
					stroke={colors.accent}
					stroke-width="2.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				{@const last = current.months.at(-1)}
				<!-- the pulse: the line's last point is *now*, and it is alive -->
				{#if phase >= 1}
					<circle
						class="pulse"
						cx={xA(last.m)}
						cy={y(last.anomaly)}
						r="5"
						fill="none"
						stroke={colors.accent}
						stroke-width="1.6"
					/>
				{/if}
				<circle cx={xA(last.m)} cy={y(last.anomaly)} r="5" fill={colors.accent} stroke={surface} stroke-width="2" />
				<text
					x={xA(last.m) + (narrow && latest ? -8 : 0)}
					y={y(last.anomaly) - 12}
					text-anchor={narrow && latest ? 'end' : 'middle'}
					font-size="12.5"
					font-weight="800"
					fill={colors.accent}
					paint-order="stroke"
					stroke={surface}
					stroke-width="3.5"
				>2026 · {fmt(last.anomaly)}</text>
			{/if}

			<!-- the cited weekly reading: an unconnected marked point. No leader, no
			     join to the 2026 line — it is a different product on a different SST
			     basis, and the legend says so. It is on the chart because it is the
			     news: it sits above the precedent envelope for the same month. -->
			{#if latest}
				<g class="fade" opacity={phase >= 1 ? 1 : 0}>
					<circle
						cx={xA(latest.m)}
						cy={y(latest.anomaly)}
						r="5"
						fill={surface}
						stroke={colors.accent}
						stroke-width="2.4"
					/>
					{#if !narrow}
						<text
							x={xA(latest.m)}
							y={y(latest.anomaly) - 13}
							text-anchor="middle"
							font-size="11.5"
							font-weight="700"
							fill={colors.accent}
							paint-order="stroke"
							stroke={surface}
							stroke-width="3.5"
						>{fmt(latest.anomaly)} °C · {data.month_names[latest.m % 12]}, weekly</text>
					{/if}
				</g>
			{/if}

			<!-- month axis -->
			{#each mTicks as t (t.m)}
				<text x={xA(t.m)} y={svgH - PAD.b + 22} text-anchor="middle" font-size="11" fill={inkC.muted}>
					{t.label}
				</text>
			{/each}

			<!-- the two timing brackets (phase 3) -->
			{#if timing}
				<g class="fade" opacity={phase >= 4 ? 1 : 0}>
					{#if timing.hardest}
						<line
							x1={xA(timing.hardest.from)}
							x2={xA(timing.hardest.to)}
							y1={svgH - PAD.b + 40}
							y2={svgH - PAD.b + 40}
							stroke={imp.drought}
							stroke-width="4"
							stroke-linecap="round"
						/>
						<text
							x={(xA(timing.hardest.from) + xA(timing.hardest.to)) / 2}
							y={svgH - PAD.b + 56}
							text-anchor="middle"
							font-size="11.5"
							font-weight="700"
							fill={imp.drought}
						>{narrow ? 'the hard months' : `the hard months — ${timing.hardest.label}`}</text>
					{/if}
					{#if timing.swingback}
						<line
							x1={xA(timing.swingback.from)}
							x2={xA(timing.swingback.to)}
							y1={svgH - PAD.b + 40}
							y2={svgH - PAD.b + 40}
							stroke={imp.frost}
							stroke-width="4"
							stroke-linecap="round"
						/>
						<text
							x={xA(timing.swingback.to)}
							y={svgH - PAD.b + 56}
							text-anchor="end"
							font-size="11.5"
							font-weight="700"
							fill={imp.frost}
						>the swing back</text>
					{/if}
				</g>
			{/if}

			{#if hoverM != null}
				<line x1={xA(hoverM)} x2={xA(hoverM)} y1={PAD.t} y2={svgH - PAD.b} stroke={inkC.axis} />
			{/if}
		</g>
	</svg>

	<!-- legend: identity never rides on color alone -->
	<div class="legend" style:color={inkC.secondary} bind:clientHeight={legendH}>
		{#if !aligned}
			<span
				><i class="sw" style:background={imp.drought}></i>El Niño (warm){#if narrow} — warm water
					drains east{/if}</span
			>
			<span
				><i class="sw" style:background={imp.frost}></i>La Niña (cool){#if narrow} — warmth piles
					back west{/if}</span
			>
		{:else}
			<span><i class="sw line" style:background={colors.accent}></i>2026, observed</span>
			{#if narrow}
				<span><i class="sw thin" style:background={inkC.grid}></i>+0.5 °C — the El Niño threshold</span>
			{/if}
			<span
				><i class="sw line" style:background={colors.ghost1}></i>the four great El Niños{#if narrow}
					{' '}({events.map((e) => e.onset).join(', ')}){/if}</span
			>
			{#if latest}
				<span
					><i class="sw ring" style:border-color={colors.accent}></i>{narrow
						? `weekly reading ${fmt(latest.anomaly)} °C — cited`
						: `latest weekly reading, ${fmt(latest.anomaly)} °C — cited, ${latest.label}`}</span
				>
			{/if}
			{#if phase >= 2}
				<span
					><i class="sw dash" style:border-color={colors.accent}></i>analogue estimate — not a
					measurement</span
				>
			{/if}
			{#if phase >= 3 && anchoredPath.length}
				<span
					><i class="sw dash faint" style:border-color={colors.accent}></i>the same shapes started
					from 2026’s level</span
				>
			{/if}
		{/if}
	</div>

	{#if hoverM != null && aligned && data}
		<div class="readout" style:color={inkC.secondary}>
			<strong style:color={inkC.primary}>{hoverLabel}</strong>
			<span><i class="sw line" style:background={colors.accent}></i>{fmt(atM(current?.months, hoverM)?.anomaly)}</span>
			{#each events as ev (ev.onset)}
				<span><i class="sw line" style:background={colors.ghost1}></i>{ev.onset}: {fmt(atM(ev.months, hoverM)?.anomaly)}</span>
			{/each}
			{#if phase >= 2 && atM(fc, hoverM) && atM(current?.months, hoverM) == null}
				<span><i class="sw dash" style:border-color={colors.accent}></i>est. {fmt(atM(fc, hoverM)?.mean)}</span>
			{/if}
		</div>
	{/if}

	{#if hoverR != null && !aligned && data}
		{@const d = recent[hoverR]}
		<div class="readout" style:color={inkC.secondary}>
			<strong style:color={inkC.primary}>{d.date}</strong>
			<span
				><i class="sw line" style:background={d.anomaly >= 0 ? imp.drought : imp.frost}></i>{fmt(d.anomaly)}
				°C</span
			>
		</div>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		width: 100%;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		touch-action: pan-y;
	}
	.fade {
		transition: opacity 0.55s;
	}

	/* the present, pulsing: an expanding ring on the line's last point.
	   transform-box keeps the scale centred on the circle itself. */
	.pulse {
		transform-box: fill-box;
		transform-origin: center;
		animation: now-pulse 2.6s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
		opacity: 0;
	}

	@keyframes now-pulse {
		0% {
			transform: scale(1);
			opacity: 0.85;
		}
		70% {
			transform: scale(3.6);
			opacity: 0;
		}
		100% {
			transform: scale(3.6);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fade {
			transition: none;
		}

		.pulse {
			animation: none;
		}
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.1rem;
		font-size: 0.74rem;
		padding-top: 0.35rem;
	}
	/* on a phone the legend is carrying labels the plot used to hold, so it has
	   more entries exactly where there is least room — tighten it, because every
	   line it takes comes straight out of the chart's own height */
	@media (max-width: 559px) {
		.legend {
			gap: 0.22rem 0.7rem;
			font-size: 0.68rem;
			line-height: 1.25;
		}
	}
	.sw {
		display: inline-block;
		width: 12px;
		height: 8px;
		border-radius: 2px;
		vertical-align: -1px;
		margin-right: 0.3rem;
	}
	.sw.line {
		height: 3px;
		vertical-align: 2px;
	}
	.sw.dash {
		height: 0;
		background: none;
		border-top: 2px dashed;
		vertical-align: 3px;
	}
	.sw.thin {
		height: 1px;
		vertical-align: 3px;
	}
	.sw.dash.faint {
		opacity: 0.55;
		border-top-width: 2px;
	}
	.sw.ring {
		width: 9px;
		height: 9px;
		background: none;
		border: 2px solid;
		border-radius: 50%;
		vertical-align: -1px;
	}
	.readout {
		position: absolute;
		top: -1.4rem;
		left: 3rem;
		display: flex;
		gap: 0.85rem;
		flex-wrap: wrap;
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}
</style>
