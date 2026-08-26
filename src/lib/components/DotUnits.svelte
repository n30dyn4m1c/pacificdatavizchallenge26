<script>
	/**
	 * DotUnits — the ledger, as things you can count. One dot = 100 kg of
	 * CO₂-equivalent per person per year. The world average (≈6.6 t → 66
	 * dots) fills against Papua New Guinea's ≈1.0 t (10 dots). Dots pop in
	 * with a tiny stagger — a static, deterministic animation driven purely
	 * by the `state` the active card sets.
	 *
	 * state 0: both groups outlined, empty (the unit is introduced)
	 * state 1: the world's 66 dots fill
	 * state 2+: PNG's 10 fill, solid, while the world's recede to a ghost
	 *
	 * The contrast is carried by weight, not by hue. PNG's dots used to fill in
	 * the warm accent — the colour that means El Niño everywhere else in the
	 * piece — which quietly told the reader that a country's emissions were
	 * "the drought colour". Emissions carry no ENSO sign, so both groups are
	 * drawn in the neutral record inks and the comparison is made by fill.
	 */
	import { ink, series as seriesColors } from '$lib/palette.js';

	let {
		world = { value: 6.6, label: 'World average' },
		png = { value: 1.0, label: 'Papua New Guinea' },
		state = 0,
		mode = 'light',
		/** measured box from Figure — the grid pitch scales to fill it */
		height = 420,
		width = 720,
		ariaLabel
	} = $props();

	const inkC = $derived(ink[mode]);
	const record = $derived(seriesColors[mode].record);
	const ghost = $derived(seriesColors[mode].ghost2);

	const COLS = 10;
	const nWorld = $derived(Math.round(world.value * 10));
	const nPng = $derived(Math.round(png.value * 10));
	const rows = $derived(Math.ceil(nWorld / COLS));

	// The ledger used to draw at a fixed 26px pitch, which left a 66-dot
	// comparison marooned in the top-left corner of a 1150 × 700 frame. The
	// pitch is now whatever fits: bounded by the rows the height allows and
	// the ten columns the width allows.
	const CHROME = 150; // two label rows + the unit note
	const GAP = $derived(
		Math.max(
			14,
			Math.min(64, (height - CHROME) / (rows + 1), (Math.min(width, 900) - 8) / COLS)
		)
	);
	const R = $derived(GAP * 0.35);

	const gridW = $derived(COLS * GAP);
	const dotXY = (i, gap) => ({
		cx: (i % COLS) * gap + gap / 2,
		cy: Math.floor(i / COLS) * gap + gap / 2
	});
	const fmt = (v) => v.toFixed(1).replace(/\.0$/, '');
</script>

<div class="units" role="img" aria-label={ariaLabel}>
	<div class="group">
		<p class="group-label">
			{world.label}
			<strong style:color={state >= 1 ? inkC.secondary : inkC.muted}>{fmt(world.value)} t</strong>
		</p>
		<svg viewBox="0 0 {gridW} {rows * GAP}" style:width="{gridW}px" aria-hidden="true">
			{#each Array.from({ length: nWorld }) as _, i (i)}
				{@const p = dotXY(i, GAP)}
				<circle
					cx={p.cx}
					cy={p.cy}
					r={R}
					fill={state >= 1 ? ghost : 'none'}
					stroke={inkC.axis}
					stroke-width="1.2"
					opacity={state >= 2 ? 0.6 : 1}
					style="transition: fill 0.35s ease {i * 12}ms, opacity 0.4s"
				/>
			{/each}
		</svg>
	</div>

	<div class="group">
		<p class="group-label">
			{png.label}
			<strong style:color={state >= 2 ? record : inkC.muted}>{fmt(png.value)} t</strong>
		</p>
		<svg viewBox="0 0 {gridW} {GAP}" style:width="{gridW}px" aria-hidden="true">
			{#each Array.from({ length: nPng }) as _, i (i)}
				{@const p = dotXY(i, GAP)}
				<circle
					cx={p.cx}
					cy={p.cy}
					r={R}
					fill={state >= 2 ? record : 'none'}
					stroke={state >= 2 ? record : inkC.axis}
					stroke-width="1.2"
					style="transition: fill 0.35s ease {i * 30}ms, stroke 0.35s ease {i * 30}ms"
				/>
			{/each}
		</svg>
	</div>

	<p class="unit-note" style:color={inkC.muted}>
		● = 100 kg of greenhouse gas (CO₂-equivalent) per person, per year
	</p>
</div>

<style>
	.units {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: clamp(1rem, 3vh, 2.25rem);
		align-items: flex-start;
		height: 100%;
	}

	.group-label {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.6rem;
		display: flex;
		gap: 0.75em;
		align-items: baseline;
	}

	.group-label strong {
		font-family: Fraunces, Georgia, serif;
		font-size: clamp(1.5rem, 3vw, 2.1rem);
		font-weight: 900;
		font-variant-numeric: tabular-nums;
		transition: color 0.4s;
	}

	svg {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.unit-note {
		font-size: 0.78rem;
		margin: 0;
	}
</style>
