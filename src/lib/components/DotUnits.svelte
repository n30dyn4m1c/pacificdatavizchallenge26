<script>
	/**
	 * DotUnits — the ledger, as things you can count. One dot = 100 kg of
	 * CO₂-equivalent per person per year. The world average (≈6.6 t → 66
	 * dots) fills against Papua New Guinea's ≈1.2 t (12 dots). Dots pop in
	 * with a tiny stagger — a static, deterministic animation driven purely
	 * by the `state` the active card sets.
	 *
	 * state 0: both groups outlined, empty (the unit is introduced)
	 * state 1: the world's 66 dots fill
	 * state 2+: PNG's 12 fill in the warm accent; the world dims slightly
	 */
	import { ink, impact, series as seriesColors } from '$lib/palette.js';

	let {
		world = { value: 6.6, label: 'World average' },
		png = { value: 1.2, label: 'Papua New Guinea' },
		state = 0,
		mode = 'light',
		ariaLabel
	} = $props();

	const inkC = $derived(ink[mode]);
	const imp = $derived(impact[mode]);
	const ghost = $derived(seriesColors[mode].ghost2);

	const COLS = 10;
	const R = 9; // dot radius
	const GAP = 26; // grid pitch
	const nWorld = $derived(Math.round(world.value * 10));
	const nPng = $derived(Math.round(png.value * 10));
	const rows = $derived(Math.ceil(nWorld / COLS));

	const gridW = COLS * GAP;
	const dotXY = (i) => ({ cx: (i % COLS) * GAP + GAP / 2, cy: Math.floor(i / COLS) * GAP + GAP / 2 });
	const fmt = (v) => v.toFixed(1).replace(/\.0$/, '');
</script>

<div class="units" role="img" aria-label={ariaLabel}>
	<div class="group">
		<p class="group-label">
			{world.label}
			<strong style:color={state >= 1 ? inkC.primary : inkC.muted}>{fmt(world.value)} t</strong>
		</p>
		<svg viewBox="0 0 {gridW} {rows * GAP}" style:width="{gridW}px" aria-hidden="true">
			{#each Array.from({ length: nWorld }) as _, i (i)}
				{@const p = dotXY(i)}
				<circle
					cx={p.cx}
					cy={p.cy}
					r={R}
					fill={state >= 1 ? inkC.secondary : 'none'}
					stroke={inkC.axis}
					stroke-width="1.2"
					opacity={state >= 2 ? 0.55 : 1}
					style="transition: fill 0.35s ease {i * 12}ms, opacity 0.4s"
				/>
			{/each}
		</svg>
	</div>

	<div class="group">
		<p class="group-label">
			{png.label}
			<strong style:color={state >= 2 ? imp.drought : inkC.muted}>{fmt(png.value)} t</strong>
		</p>
		<svg viewBox="0 0 {gridW} {GAP * 2}" style:width="{gridW}px" aria-hidden="true">
			{#each Array.from({ length: nPng }) as _, i (i)}
				{@const p = dotXY(i)}
				<circle
					cx={p.cx}
					cy={p.cy}
					r={R}
					fill={state >= 2 ? imp.drought : 'none'}
					stroke={state >= 2 ? imp.drought : inkC.axis}
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
		gap: 2rem;
		align-items: flex-start;
	}

	.group-label {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
		display: flex;
		gap: 0.75em;
		align-items: baseline;
	}

	.group-label strong {
		font-family: Fraunces, Georgia, serif;
		font-size: 1.5rem;
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
