<script>
	/**
	 * PacificMap — chapter one's sticky graphic. A real-coastline map of the
	 * tropical Pacific (Natural Earth, pre-projected by prep/make_maps.mjs)
	 * with Papua New Guinea in the west and the Niño 3.4 detection box far to
	 * the east. The warm pool is drawn as a schematic blob that slides east
	 * (El Niño) or piles back west (La Niña) as the cards advance; the rain
	 * glyphs ride on top of it, because the rain machine IS the warm water.
	 *
	 * `idx` (0–4): geography → normal years → El Niño → La Niña → read early.
	 */
	import { ink, impact, surfaces } from '$lib/palette.js';

	let { map, idx = 0, ariaLabel } = $props();

	const inkC = ink.light;
	const imp = impact.light;

	// warm-pool center per state (px in the map's projected space):
	// home (over PNG's doorstep) → Niño 3.4 (El Niño) → piled far west (La Niña)
	const POOL_HOME = 300;
	const POOL_EAST = 560;
	const POOL_WEST = 235;
	const poolX = $derived(idx >= 4 ? POOL_EAST : idx === 3 ? POOL_WEST : idx === 2 ? POOL_EAST : POOL_HOME);
	const poolVisible = $derived(idx >= 1);
	const elnino = $derived(idx === 2 || idx === 4);
	const lanina = $derived(idx === 3);

	const CLOUDS = [-70, 0, 70];
</script>

<div class="wrap">
	<svg viewBox="0 0 {map.w} {map.h}" role="img" aria-label={ariaLabel}>
		<defs>
			<radialGradient id="pool-grad" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color={imp.drought} stop-opacity="0.55" />
				<stop offset="70%" stop-color={imp.drought} stop-opacity="0.28" />
				<stop offset="100%" stop-color={imp.drought} stop-opacity="0" />
			</radialGradient>
			<marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
				<path d="M0 0L10 5L0 10z" fill={inkC.primary} />
			</marker>
		</defs>

		<!-- ocean -->
		<rect width={map.w} height={map.h} rx="6" fill="color-mix(in srgb, {imp.frost} 8%, {surfaces.paper})" />

		<!-- equator -->
		<line x1="0" x2={map.w} y1={map.equator_y} y2={map.equator_y} stroke={inkC.axis} stroke-width="1" stroke-dasharray="3 5" />
		<text x={map.w - 8} y={map.equator_y - 5} text-anchor="end" font-size="11" fill={inkC.muted}>equator</text>

		<!-- land: real Natural Earth coastlines -->
		<g>
			{#each map.land as d, i (i)}
				<path {d} fill={inkC.grid} stroke={inkC.axis} stroke-width="0.5" />
			{/each}
		</g>

		<!-- the warm pool: schematic, slides with the ENSO state -->
		<g
			class="pool"
			style:opacity={poolVisible ? 1 : 0}
			style:transform="translateX({poolX - POOL_HOME}px)"
		>
			<ellipse cx={POOL_HOME} cy={map.equator_y + 12} rx="150" ry="44" fill="url(#pool-grad)" />
			<text x={POOL_HOME} y={map.equator_y + 64} text-anchor="middle" font-size="12" font-weight="700" fill={imp.drought}>
				the warm pool — and the rain that lives on it
			</text>
			<!-- rain glyphs riding the warm water -->
			{#each CLOUDS as dx (dx)}
				<g transform="translate({POOL_HOME + dx} {map.equator_y - 26})">
					<ellipse cx="0" cy="0" rx="16" ry="8" fill={inkC.secondary} opacity="0.75" />
					<g stroke={imp.frost} stroke-width="2" stroke-linecap="round" opacity="0.9">
						<line x1="-8" y1="10" x2="-11" y2="19" />
						<line x1="0" y1="10" x2="-3" y2="19" />
						<line x1="8" y1="10" x2="5" y2="19" />
					</g>
				</g>
			{/each}
		</g>

		<!-- movement arrows along the equator -->
		{#if elnino}
			<path
				class="flow"
				d="M330 {map.equator_y - 18} C 400 {map.equator_y - 40}, 470 {map.equator_y - 40}, 540 {map.equator_y - 18}"
				fill="none"
				stroke={inkC.primary}
				stroke-width="2.2"
				marker-end="url(#flow-arrow)"
			/>
		{:else if lanina}
			<path
				class="flow"
				d="M540 {map.equator_y - 18} C 470 {map.equator_y - 40}, 400 {map.equator_y - 40}, 330 {map.equator_y - 18}"
				fill="none"
				stroke={inkC.primary}
				stroke-width="2.2"
				marker-end="url(#flow-arrow)"
			/>
		{/if}

		<!-- the Niño 3.4 detection box -->
		<g>
			<rect
				x={map.nino34.x}
				y={map.nino34.y}
				width={map.nino34.w}
				height={map.nino34.h}
				fill={elnino ? `color-mix(in srgb, ${imp.drought} 14%, transparent)` : lanina ? `color-mix(in srgb, ${imp.frost} 14%, transparent)` : 'none'}
				stroke={inkC.primary}
				stroke-width="1.6"
				stroke-dasharray="6 4"
				style="transition: fill 0.6s"
			/>
			<text x={map.nino34.x + map.nino34.w / 2} y={map.nino34.y - 10} text-anchor="middle" font-size="13" font-weight="700" fill={inkC.primary}>
				Niño 3.4 — where El Niño is measured
			</text>
			<text x={map.nino34.x + map.nino34.w / 2} y={map.nino34.y + map.nino34.h + 16} text-anchor="middle" font-size="11" fill={inkC.muted}>
				5°N–5°S · 170°W–120°W · open ocean
			</text>
			{#if idx >= 4}
				<!-- the thermometer: the box is an instrument, read months early -->
				<g transform="translate({map.nino34.x + map.nino34.w / 2} {map.nino34.y + map.nino34.h / 2})">
					<rect x="-3" y="-16" width="6" height="24" rx="3" fill={surfaces.paperRaised} stroke={inkC.primary} stroke-width="1.4" />
					<circle cx="0" cy="12" r="6" fill={imp.drought} stroke={inkC.primary} stroke-width="1.4" />
					<rect x="-1.4" y="-6" width="2.8" height="16" fill={imp.drought} />
				</g>
			{/if}
		</g>

		<!-- Papua New Guinea, in home ink -->
		<g>
			{#each map.png as d, i (i)}
				<path {d} fill={inkC.primary} />
			{/each}
			<text x={map.points.port_moresby.x + 4} y={map.points.port_moresby.y + 30} font-size="13" font-weight="800" fill={inkC.primary}>
				Papua New Guinea
			</text>
			{#if elnino}
				<text x={map.points.port_moresby.x + 4} y={map.points.port_moresby.y + 46} font-size="12" font-weight="700" fill={imp.drought}>
					the rain has gone east
				</text>
			{:else if lanina}
				<text x={map.points.port_moresby.x + 4} y={map.points.port_moresby.y + 46} font-size="12" font-weight="700" fill={imp.frost}>
					the rain comes home — hard
				</text>
			{/if}
		</g>

		<!-- distance tie between the two places -->
		{#if idx === 0}
			<g>
				<path
					d="M{map.points.port_moresby.x + 14} {map.points.port_moresby.y - 6} C 380 {map.equator_y + 66}, 470 {map.equator_y + 66}, {map.nino34.x + map.nino34.w / 2} {map.nino34.y + map.nino34.h + 26}"
					fill="none"
					stroke={inkC.muted}
					stroke-width="1.3"
					stroke-dasharray="2 5"
				/>
				<text x="430" y={map.equator_y + 86} text-anchor="middle" font-size="12" font-weight="600" fill={inkC.secondary}>
					≈ {map.distance_km.toLocaleString('en')} km to the middle of the box
				</text>
			</g>
		{/if}
	</svg>
</div>

<style>
	.wrap {
		width: 100%;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.pool {
		transition: transform 1.1s ease-in-out, opacity 0.6s;
	}

	.flow {
		stroke-dasharray: 240;
		stroke-dashoffset: 240;
		animation: flow-in 1.1s ease-out 0.15s forwards;
	}

	@keyframes flow-in {
		to {
			stroke-dashoffset: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pool {
			transition: opacity 0.6s;
		}

		.flow {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
</style>
