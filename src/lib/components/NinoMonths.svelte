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
	 *    nowhere else in the piece). phase 3 adds the two timing brackets
	 *    (the hard months / the swing back).
	 *
	 * Data: static/data/scene_now.json (NOAA PSL Niño 3.4 monthly; the
	 * estimate is computed by /prep, never here).
	 */
	import { scaleLinear } from 'd3-scale';
	import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
	import { ink, impact, series as seriesColors, surfaces } from '$lib/palette.js';

	let {
		data, //           scene_now.json
		phase = 0, //      0 recent · 1 aligned · 2 +estimate · 3 +timing
		progress = 1, //   0–1 draw-in within the current phase
		mode = 'light',
		height = 470,
		ariaLabel
	} = $props();

	const PAD = { l: 46, r: 104, t: 58, b: 66 };
	let w = $state(720);
	const W = $derived(Math.max(w, 300));

	const inkC = $derived(ink[mode]);
	const imp = $derived(impact[mode]);
	const colors = $derived(seriesColors[mode]);
	const surface = $derived(mode === 'light' ? surfaces.paper : surfaces.ocean);

	const aligned = $derived(phase >= 1);
	const frac = $derived(Math.max(0, Math.min(1, progress)));

	// one shared y scale across both views, so the crossfade keeps its ground
	const y = $derived(scaleLinear([-2.6, 3.05], [height - PAD.b, PAD.t]));

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
			{ i: elnino.i, v: elnino.anomaly, dy: -10, text: 'El Niño 2023–24', color: imp.drought },
			{ i: lanina.i, v: lanina.anomaly, dy: 20, text: 'La Niña, twice — weak', color: imp.frost },
			{ i: recent.length - 1, v: now.anomaly, dy: -10, text: 'now', color: imp.drought }
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
	const timing = $derived(data?.timing);

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

	// hover readout (aligned view): nearest month across all series
	let hoverM = $state(null);
	function onMove(e) {
		if (!aligned) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * W;
		hoverM = Math.max(0, Math.min(SPAN - 1, Math.round(xA.invert(px))));
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
		viewBox="0 0 {W} {height}"
		role="img"
		aria-label={ariaLabel}
		onpointermove={onMove}
		onpointerleave={() => (hoverM = null)}
	>
		<!-- shared frame: zero line + the El Niño threshold -->
		<line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke={inkC.axis} stroke-width="1.4" />
		<line x1={PAD.l} x2={W - PAD.r} y1={y(0.5)} y2={y(0.5)} stroke={inkC.grid} stroke-width="1" />
		<text x={W - PAD.r - 4} y={y(0.5) - 5} text-anchor="end" font-size="10" fill={inkC.muted}>
			+0.5 °C — the El Niño threshold
		</text>
		{#each [-2, -1, 1, 2, 3] as t (t)}
			<text x={PAD.l - 7} y={y(t) + 3.5} text-anchor="end" font-size="10.5" fill={inkC.muted}>
				{t > 0 ? '+' + t : t}
			</text>
		{/each}
		<text x={PAD.l - 7} y={y(0) + 3.5} text-anchor="end" font-size="10.5" fill={inkC.secondary}>0 °C</text>

		<!-- ── view 1: the recent see-saw, in months ─────────────────────────── -->
		<g class="fade" opacity={aligned ? 0 : 1} style:pointer-events="none">
			<text x={PAD.l + 2} y={PAD.t - 34} font-size="12.5" font-weight="700" fill={imp.drought}>
				El Niño ↑ warm water drains east
			</text>
			<text x={PAD.l + 2} y={height - PAD.b + 40} font-size="12.5" font-weight="700" fill={imp.frost}>
				La Niña ↓ warmth piles back west
			</text>
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
				<text x={xR(t.i)} y={height - PAD.b + 22} text-anchor="middle" font-size="11" fill={inkC.muted}>
					{t.date.slice(0, 4)}
				</text>
			{/each}
			{#each annR as a (a.text)}
				<text
					x={Math.min(xR(a.i), W - PAD.r)}
					y={y(Math.max(0, a.v)) + (a.dy < 0 ? a.dy : 0) + (a.v < 0 ? y(a.v) - y(0) + a.dy + 8 : 0)}
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
				{#if timing}
					<text
						x={xA(7)}
						y={PAD.t + 4}
						text-anchor="middle"
						font-size="11.5"
						font-weight="600"
						fill={inkC.secondary}
						paint-order="stroke"
						stroke={surface}
						stroke-width="3.5"
					>estimate — the four precedents’ range</text>
					<text
						x={xA(7)}
						y={PAD.t + 18}
						text-anchor="middle"
						font-size="11.5"
						fill={inkC.muted}
						paint-order="stroke"
						stroke={surface}
						stroke-width="3.5"
					>weighted path peaks ≈ {fmt(timing.peak.mean)} °C · {timing.peak.label}</text>
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
				<circle cx={xA(last.m)} cy={y(last.anomaly)} r="5" fill={colors.accent} stroke={surface} stroke-width="2" />
				<text
					x={xA(last.m)}
					y={y(last.anomaly) - 12}
					text-anchor="middle"
					font-size="12.5"
					font-weight="800"
					fill={colors.accent}
					paint-order="stroke"
					stroke={surface}
					stroke-width="3.5"
				>2026 · {fmt(last.anomaly)}</text>
			{/if}

			<!-- month axis -->
			{#each mTicks as t (t.m)}
				<text x={xA(t.m)} y={height - PAD.b + 22} text-anchor="middle" font-size="11" fill={inkC.muted}>
					{t.label}
				</text>
			{/each}

			<!-- the two timing brackets (phase 3) -->
			{#if timing}
				<g class="fade" opacity={phase >= 3 ? 1 : 0}>
					{#if timing.hardest}
						<line
							x1={xA(timing.hardest.from)}
							x2={xA(timing.hardest.to)}
							y1={height - PAD.b + 40}
							y2={height - PAD.b + 40}
							stroke={imp.drought}
							stroke-width="4"
							stroke-linecap="round"
						/>
						<text
							x={(xA(timing.hardest.from) + xA(timing.hardest.to)) / 2}
							y={height - PAD.b + 56}
							text-anchor="middle"
							font-size="11.5"
							font-weight="700"
							fill={imp.drought}
						>the hard months — {timing.hardest.label}</text>
					{/if}
					{#if timing.swingback}
						<line
							x1={xA(timing.swingback.from)}
							x2={xA(timing.swingback.to)}
							y1={height - PAD.b + 40}
							y2={height - PAD.b + 40}
							stroke={imp.frost}
							stroke-width="4"
							stroke-linecap="round"
						/>
						<text
							x={xA(timing.swingback.to)}
							y={height - PAD.b + 56}
							text-anchor="end"
							font-size="11.5"
							font-weight="700"
							fill={imp.frost}
						>the swing back</text>
					{/if}
				</g>
			{/if}

			{#if hoverM != null}
				<line x1={xA(hoverM)} x2={xA(hoverM)} y1={PAD.t} y2={height - PAD.b} stroke={inkC.axis} />
			{/if}
		</g>
	</svg>

	<!-- legend: identity never rides on color alone -->
	<div class="legend" style:color={inkC.secondary}>
		{#if !aligned}
			<span><i class="sw" style:background={imp.drought}></i>El Niño (warm)</span>
			<span><i class="sw" style:background={imp.frost}></i>La Niña (cool)</span>
		{:else}
			<span><i class="sw line" style:background={colors.accent}></i>2026, observed</span>
			<span><i class="sw line" style:background={colors.ghost1}></i>the four great El Niños</span>
			{#if phase >= 2}
				<span><i class="sw dash" style:border-color={colors.accent}></i>analogue estimate — not a measurement</span>
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
	@media (prefers-reduced-motion: reduce) {
		.fade {
			transition: none;
		}
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.1rem;
		font-size: 0.74rem;
		padding-top: 0.35rem;
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
