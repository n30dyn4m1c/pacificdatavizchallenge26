<script>
	/**
	 * IslandProfile — chapter four's sideways view: a schematic elevation
	 * cross-section of Papua New Guinea along the A–B cut (south coast →
	 * Mt Wilhelm → north coast), drawn in drought. The cards walk up the
	 * profile: coast & islands, the lowland river plains, the Highlands by
	 * day, the same Highlands on a clear drought night (the sky turns and
	 * the frost zone lights up), then the whole island at once.
	 *
	 * This is an explicitly labelled illustration — vertical scale is
	 * exaggerated and no value here comes from a dataset. It exists to give
	 * the record's numbers a landscape to land on.
	 *
	 * `state` (1–5): coast → rivers → highlands day → highlands night → all.
	 */
	import { ink, impact, surfaces } from '$lib/palette.js';

	let { state = 1, ariaLabel } = $props();

	const inkC = ink.light;
	const imp = impact.light;

	// (x, elevation m) samples along the cut; y(m) maps 4,509 m → 330 px
	const SEA_Y = 400;
	const K = 330 / 4509;
	const y = (m) => SEA_Y - m * K;
	const TERRAIN = [
		[60, 0], [120, 15], [200, 20], [300, 45], [380, 130], [440, 700],
		[500, 1450], [535, 1650], [575, 1580], [615, 2050], [660, 2800],
		[690, 3600], [715, 4509], [745, 3300], [775, 2200], [805, 1150],
		[835, 480], [865, 110], [895, 25], [920, 0]
	];
	const terrainD =
		`M0 440L0 428L60 ${SEA_Y}` +
		TERRAIN.slice(1).map(([px, m]) => `L${px} ${y(m).toFixed(1)}`).join('') +
		`L1000 428L1000 440Z`;

	// the zone above the frost line (~2,200 m), interpolated from TERRAIN
	const FROST_M = 2200;
	const frostD = `M624 ${y(FROST_M).toFixed(1)}L660 ${y(2800).toFixed(1)}L690 ${y(3600).toFixed(1)}L715 ${y(4509).toFixed(1)}L745 ${y(3300).toFixed(1)}L775 ${y(FROST_M).toFixed(1)}Z`;

	// kaukau gardens: mounds on the highland valley floors and upper slopes
	const GARDENS = [
		[505, 1450], [525, 1620], [545, 1650], [565, 1610], [590, 1800],
		[610, 2000], [630, 2350], [648, 2600], [770, 2250], [788, 1700], [800, 1250]
	];

	const night = $derived(state === 4);
	const zones = $derived({
		coast: state === 1 || state === 5,
		lowland: state === 2 || state === 5,
		highland: state === 3 || state === 4 || state === 5
	});

	const STARS = [
		[80, 60], [170, 110], [255, 45], [330, 90], [420, 55], [480, 130],
		[560, 40], [820, 70], [880, 120], [930, 50], [960, 95], [610, 95]
	];
</script>

<div class="wrap">
	<svg viewBox="0 0 1000 470" role="img" aria-label={ariaLabel}>
		<!-- sky: paper by day, deep ocean-night when the frost card arrives -->
		<rect class="sky" width="1000" height="440" rx="6" fill={night ? surfaces.ocean : `color-mix(in srgb, ${imp.frost} 5%, ${surfaces.paper})`} />
		{#if night}
			<g class="fade-in">
				{#each STARS as [sx, sy], i (i)}
					<circle cx={sx} cy={sy} r={i % 3 === 0 ? 1.8 : 1.2} fill={ink.dark.primary} opacity="0.9" />
				{/each}
				<!-- the day's heat leaving for space: nothing above to hold it -->
				<g stroke={imp.frost} stroke-width="2" stroke-linecap="round" fill="none" opacity="0.85">
					<path d="M660 175 q6 -14 0 -28 q-6 -14 0 -28" />
					<path d="M715 45 q6 -14 0 -28" />
					<path d="M762 195 q6 -14 0 -28 q-6 -14 0 -28" />
				</g>
				<text x="988" y="128" text-anchor="end" font-size="13" font-weight="700" fill={imp.frost}>
					no cloud — the day’s heat escapes to space
				</text>
			</g>
		{/if}

		<!-- sun on the day card -->
		{#if state === 3}
			<g class="fade-in" transform="translate(510 82)">
				<circle r="20" fill={imp.drought} opacity="0.9" />
				{#each Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4 + Math.PI / 8) as angle (angle)}
					<line
						x1={Math.cos(angle) * 27}
						y1={Math.sin(angle) * 27}
						x2={Math.cos(angle) * 36}
						y2={Math.sin(angle) * 36}
						stroke={imp.drought}
						stroke-width="2.6"
						stroke-linecap="round"
					/>
				{/each}
			</g>
		{/if}

		<!-- sea, both coasts, plus the offshore islands -->
		<rect x="0" y={SEA_Y} width="60" height="40" fill="color-mix(in srgb, {imp.frost} 30%, {surfaces.paper})" />
		<rect x="920" y={SEA_Y} width="80" height="40" fill="color-mix(in srgb, {imp.frost} 30%, {surfaces.paper})" />
		<path d="M934 400L948 376L962 400Z" fill={inkC.grid} stroke={inkC.axis} stroke-width="1" />
		<path d="M968 400L980 382L993 400Z" fill={inkC.grid} stroke={inkC.axis} stroke-width="1" />

		<!-- the island, cut sideways -->
		<path d={terrainD} fill={inkC.grid} stroke={inkC.axis} stroke-width="1.2" />

		<!-- zone highlights -->
		<rect class="zone" x="0" y="56" width="195" height="388" rx="8" fill={imp.drought} opacity={zones.coast ? 0.1 : 0} />
		<rect class="zone" x="898" y="56" width="102" height="388" rx="8" fill={imp.drought} opacity={zones.coast ? 0.1 : 0} />
		<rect class="zone" x="120" y="56" width="310" height="388" rx="8" fill={imp.drought} opacity={zones.lowland ? 0.1 : 0} />
		<rect class="zone" x="835" y="56" width="60" height="388" rx="8" fill={imp.drought} opacity={zones.lowland ? 0.1 : 0} />
		<rect class="zone" x="440" y="56" width="375" height="388" rx="8" fill={imp.drought} opacity={zones.highland && !night ? 0.1 : 0} />

		<!-- rivers crossing the lowlands, drawn LOW: exposed banks both sides -->
		<g>
			<rect x="150" y="395" width="120" height="6" rx="3" fill={inkC.secondary} opacity="0.35" />
			<rect x="185" y="397" width="50" height="4" rx="2" fill={imp.frost} />
			<!-- a barge aground on the exposed bank -->
			<g transform="translate(246 393) rotate(8)">
				<rect x="-11" y="0" width="22" height="6" rx="1.5" fill={inkC.primary} />
				<rect x="-4" y="-5" width="8" height="5" fill={inkC.primary} />
			</g>
			<rect x="858" y="395" width="46" height="6" rx="3" fill={inkC.secondary} opacity="0.35" />
			<rect x="870" y="397" width="22" height="4" rx="2" fill={imp.frost} />
		</g>

		<!-- villages: coast and river plain -->
		<g fill={inkC.primary}>
			<path d="M92 400L99 390L106 400Z" />
			<path d="M108 400L115 390L122 400Z" />
			<path d="M312 397L319 387L326 397Z" />
			<path d="M328 397L335 387L342 397Z" />
		</g>

		<!-- kaukau gardens: healthy ink by default, scorched on the day card,
		     frozen on the night card -->
		{#each GARDENS as [gx, gm] (gx)}
			{@const above = gm >= FROST_M}
			<path
				d="M{gx - 5} {y(gm).toFixed(1)} a5 5 0 0 1 10 0Z"
				fill={night && above ? imp.frost : state === 3 ? imp.drought : inkC.secondary}
				style="transition: fill 0.5s"
			/>
		{/each}

		<!-- frost line -->
		<line
			x1="430"
			x2="830"
			y1={y(FROST_M)}
			y2={y(FROST_M)}
			stroke={imp.frost}
			stroke-width={night ? 2 : 1.3}
			stroke-dasharray="7 5"
			opacity={night || state >= 3 ? 0.95 : 0.5}
		/>
		<text x="832" y={y(FROST_M) + 4} font-size="12" font-weight="700" fill={imp.frost} opacity={state >= 3 ? 1 : 0.6}>
			≈ 2,200 m — the frost line
		</text>

		{#if night}
			<g class="fade-in">
				<path d={frostD} fill="color-mix(in srgb, {imp.frost} 45%, transparent)" />
				<text x="628" y={y(FROST_M) + 22} font-size="13" font-weight="800" fill={imp.frost}>
					dawn: below 0 °C
				</text>
			</g>
		{/if}

		<!-- fixed reference labels -->
		<text x="715" y="58" text-anchor="middle" font-size="13" font-weight="700" fill={night ? ink.dark.primary : inkC.primary}>
			Mt Wilhelm · 4,509 m
		</text>
		<text x="30" y="456" font-size="13" font-weight="800" fill={inkC.primary}>A</text>
		<text x="46" y="456" font-size="12" fill={inkC.muted}>south coast</text>
		<text x="970" y="456" font-size="13" font-weight="800" fill={inkC.primary} text-anchor="end">B</text>
		<text x="905" y="456" font-size="12" fill={inkC.muted} text-anchor="end">north coast</text>

		<!-- zone names: the active zone reads dark, the rest recede -->
		<text x="105" y="372" text-anchor="middle" font-size="13" font-weight="700"
			fill={zones.coast ? inkC.primary : inkC.muted} style="transition: fill 0.4s">
			coast &amp; islands
		</text>
		<text x="300" y="360" text-anchor="middle" font-size="13" font-weight="700"
			fill={zones.lowland ? inkC.primary : inkC.muted} style="transition: fill 0.4s">
			lowland river plains
		</text>
		<text x="545" y="252" text-anchor="middle" font-size="13" font-weight="700"
			fill={zones.highland ? (night ? ink.dark.primary : inkC.primary) : inkC.muted} style="transition: fill 0.4s">
			the Highlands
		</text>

		<!-- elevation ticks -->
		<g font-size="11" fill={night ? ink.dark.muted : inkC.muted}>
			{#each [0, 1000, 2000, 3000, 4000] as m (m)}
				<text x="8" y={y(m) + 4}>{m === 0 ? '0 m' : m.toLocaleString('en')}</text>
			{/each}
		</g>
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

	.sky {
		transition: fill 0.8s ease;
	}

	.zone {
		transition: opacity 0.5s;
	}

	.fade-in {
		animation: fade-in 0.8s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sky {
			transition: none;
		}

		.fade-in {
			animation: none;
		}
	}
</style>
