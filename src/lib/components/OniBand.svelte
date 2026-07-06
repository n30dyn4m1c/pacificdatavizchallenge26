<script>
	/**
	 * OniBand — the piece's only section-divider ornament: the ONI record
	 * itself, 1982 → present, abstracted into a thin repeating geometric
	 * strip. One bar per DJF season, height = |ONI|, up for El Niño years,
	 * down for La Niña, drawn in the palette's neutrals (currentColor — the
	 * placement sets the ink). Deliberately austere: data as decoration,
	 * never imagery. Purely decorative (aria-hidden).
	 *
	 * Values are approximate DJF-peak ONI per season from the CPC ONI table
	 * (decorative abstraction only — the charts read real series from
	 * static/data/). The final value is the piece's 2026–27 forecast peak.
	 */
	const ONI = [
		2.2, -0.6, -1.0, -0.5, 1.2, 0.8, -1.7, 0.1, 0.4, 1.7, 0.1, 0.1, 1.0,
		-0.9, -0.5, 2.4, -1.5, -1.7, -0.7, -0.1, 0.9, 0.4, 0.6, -0.9, 0.7,
		-1.6, -0.8, 1.5, -1.4, -0.8, -0.4, -0.4, 0.5, 2.6, -0.3, -0.9, 0.7,
		0.5, -1.0, -1.0, -0.7, 2.0, -0.6, 2.8
	];
	const STEP = 8;
	const MID = 13;
</script>

<div class="oni-band no-print" aria-hidden="true">
	<svg viewBox="0 0 {ONI.length * STEP} 26" preserveAspectRatio="xMidYMid meet">
		<line x1="0" x2={ONI.length * STEP} y1={MID} y2={MID} stroke="currentColor" stroke-opacity="0.25" />
		{#each ONI as v, i (i)}
			<rect
				x={i * STEP + 2.5}
				width="3"
				y={v > 0 ? MID - v * 4.3 : MID}
				height={Math.max(1.2, Math.abs(v) * 4.3)}
				fill="currentColor"
				fill-opacity="0.55"
			/>
		{/each}
	</svg>
</div>

<style>
	.oni-band {
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.oni-band svg {
		width: min(22rem, 60vw);
		height: 26px;
	}
</style>
