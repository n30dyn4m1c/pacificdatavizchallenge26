<script>
	/**
	 * PngMap — Papua New Guinea itself, from the real Natural Earth geometry
	 * in scene_map.json: the mainland and island provinces, the four great
	 * rivers, and an illustrative band marking where the Highlands run. Used
	 * as chapter four's opening layer (with the A–B profile cut drawn on it)
	 * so the sideways elevation view that follows has a place on a real map.
	 */
	import { ink, impact, surfaces } from '$lib/palette.js';

	let { map, showCut = false, ariaLabel } = $props();

	const inkC = ink.light;
	const imp = impact.light;
</script>

<div class="wrap">
	<svg viewBox="0 0 {map.w} {map.h}" role="img" aria-label={ariaLabel}>
		<!-- sea -->
		<rect width={map.w} height={map.h} rx="6" fill="color-mix(in srgb, {imp.frost} 8%, {surfaces.paper})" />

		<!-- the country -->
		{#each map.country as d, i (i)}
			<path {d} fill={inkC.grid} stroke={inkC.axis} stroke-width="1" />
		{/each}

		<!-- the Highlands band (illustrative marker, not a DEM) -->
		<path d={map.highlands} fill="color-mix(in srgb, {imp.drought} 22%, transparent)" />

		<!-- rivers -->
		{#each map.rivers as r (r.d)}
			<path d={r.d} fill="none" stroke={imp.frost} stroke-width="2.4" stroke-linecap="round" opacity="0.85" />
		{/each}

		<!-- labels -->
		{#each map.labels as l (l.text)}
			<text x={l.x} y={l.y} font-size="17" font-weight="600" fill={inkC.secondary} text-anchor="middle">{l.text}</text>
		{/each}

		<!-- reference points -->
		{#each [map.points.port_moresby, map.points.mt_wilhelm, map.points.kiunga] as pt (pt.name)}
			<circle cx={pt.x} cy={pt.y} r="5.5" fill={inkC.primary} />
			<text x={pt.x + 10} y={pt.y + 5} font-size="16" font-weight="700" fill={inkC.primary}>{pt.name}</text>
		{/each}

		<!-- the A–B profile cut -->
		{#if showCut}
			<g class="cut">
				<line
					x1={map.profile_cut.x1}
					y1={map.profile_cut.y1}
					x2={map.profile_cut.x2}
					y2={map.profile_cut.y2}
					stroke={inkC.primary}
					stroke-width="3"
					stroke-dasharray="8 6"
				/>
				<text x={map.profile_cut.x1 - 8} y={map.profile_cut.y1 + 24} font-size="19" font-weight="800" fill={inkC.primary} text-anchor="middle">A</text>
				<text x={map.profile_cut.x2 + 2} y={map.profile_cut.y2 - 12} font-size="19" font-weight="800" fill={inkC.primary} text-anchor="middle">B</text>
			</g>
		{/if}
	</svg>
</div>

<style>
	.wrap {
		width: 100%;
		max-width: 46rem;
		margin: 0 auto;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.cut {
		animation: cut-in 0.7s ease-out;
	}

	@keyframes cut-in {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cut {
			animation: none;
		}
	}
</style>
