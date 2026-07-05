<script>
	/**
	 * MoundIllustration — the hand-authored, layered cross-section of a
	 * kaukau mound in a Highlands garden (~2,300 m): sky above, mounded
	 * soil with vines at the surface, tubers in cutaway below ground, a
	 * tanket (cordyline) at the garden edge. Every element is addressable;
	 * two scroll-driven uniforms animate it:
	 *   night 0–1 — dusk → clear El Niño night (sky darkens, stars out)
	 *   frost 0–1 — leaves crossfade to burned, the soil surface cracks
	 * The frost-crystal creep itself is FrostCanvas, overlaid by the scene.
	 * Purely presentational (the scene's prose + steps carry the story).
	 *
	 * Lazy-loaded by Scene5Garden via dynamic import — it ships in its own
	 * chunk, fetched only as the scene approaches.
	 */
	let { night = 0, frost = 0 } = $props();

	// leaf clusters draped along the mound crest: x, y, scale, rotation
	const clusters = [
		[300, 412, 2.6, -18],
		[352, 378, 2.9, -10],
		[418, 350, 3.2, -4],
		[500, 340, 3.4, 0],
		[576, 348, 3.2, 5],
		[644, 368, 2.9, 12],
		[706, 398, 2.6, 20],
		[382, 398, 2.2, -30],
		[612, 402, 2.2, 26]
	];

	// deterministic star field (fixed, hand-placed feel)
	const stars = [
		[64, 60, 1.6], [150, 132, 1.1], [242, 48, 1.4], [318, 108, 1.0],
		[402, 66, 1.7], [472, 150, 1.1], [548, 84, 1.3], [636, 40, 1.0],
		[694, 128, 1.6], [760, 76, 1.1], [842, 160, 1.3], [906, 52, 1.5],
		[956, 122, 1.0], [124, 208, 1.0], [288, 186, 1.2], [516, 214, 1.0],
		[708, 224, 1.2], [878, 232, 1.0], [200, 84, 0.9], [590, 178, 0.9]
	];

	const healthyGreens = ['#5f7a44', '#54703c', '#6b874e'];
	const burnedBrowns = ['#4a3a2e', '#3b2f26', '#57453a'];
</script>

<svg
	viewBox="0 0 1000 700"
	preserveAspectRatio="xMidYMid meet"
	class="mound-svg"
	aria-hidden="true"
>
	<defs>
		<linearGradient id="m-dusk" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#2b3a5e" />
			<stop offset="0.55" stop-color="#7a5b74" />
			<stop offset="1" stop-color="#e8955e" />
		</linearGradient>
		<linearGradient id="m-soil" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#5d4c37" />
			<stop offset="1" stop-color="#3a2d1f" />
		</linearGradient>
		<!-- true crescent: mask instead of an overlay disc, so no dark circle
		     shows against a half-darkened sky -->
		<mask id="m-crescent">
			<circle cx="852" cy="92" r="24" fill="#fff" />
			<circle cx="842" cy="84" r="22" fill="#000" />
		</mask>
	</defs>

	<!-- ── sky at dusk ─────────────────────────────────────────────────── -->
	<rect x="0" y="0" width="1000" height="434" fill="url(#m-dusk)" />

	<!-- distant valley ridgelines -->
	<path d="M0 340 Q 140 280 300 322 Q 430 356 560 330 L 560 434 L 0 434 Z" fill="#3a4a63" opacity="0.8" />
	<path d="M420 352 Q 600 292 780 330 Q 900 354 1000 336 L 1000 434 L 420 434 Z" fill="#2c3850" opacity="0.9" />

	<!-- the tanket (cordyline) at the garden edge: the traditional
	     early-warning plant, given the same visual weight as everything else -->
	<g class="tanket">
		<path d="M128 428 C 126 400 127 372 130 344" stroke="#4a3a2e" stroke-width="5" fill="none" />
		{#each [[-64, -20, '#7a4a4a'], [-40, -38, '#8a5a52'], [-12, -46, '#6b874e'], [16, -42, '#7a4a4a'], [44, -32, '#8a5a52'], [62, -14, '#6b5943']] as [dx, dy, c], i (i)}
			<path
				d="M130 344 C {130 + dx * 0.4} {344 + dy * 0.9 - 8}, {130 + dx * 0.85} {344 + dy - 6}, {130 + dx} {344 + dy}
				   C {130 + dx * 0.7} {344 + dy * 0.55 + 6}, {130 + dx * 0.3} {344 + 2}, 130 348 Z"
				fill={c}
			/>
		{/each}
	</g>

	<!-- night falls: the sky layer darkens toward the ocean-black of scene 1 -->
	<rect x="0" y="0" width="1000" height="434" fill="#060a12" opacity={night * 0.88} />

	<!-- stars + a thin moon come out with the dark -->
	<g opacity={night}>
		{#each stars as [sx, sy, r], i (i)}
			<circle cx={sx} cy={sy} r={r} fill="#e8f1fb" opacity="0.9" />
		{/each}
		<circle cx="852" cy="92" r="24" fill="#e8e2d4" mask="url(#m-crescent)" />
	</g>

	<!-- ── the cutaway: ground and mound ───────────────────────────────── -->
	<!-- below-ground soil block -->
	<rect x="0" y="434" width="1000" height="266" fill="url(#m-soil)" />
	<!-- ground darkens a little with the night too -->
	<rect x="0" y="434" width="1000" height="266" fill="#060a12" opacity={night * 0.35} />

	<!-- the mound itself, rising above the ground line -->
	<path d="M244 436 Q 310 348 500 334 Q 690 348 756 436 Z" fill="#5d4c37" />
	<path d="M244 436 Q 310 348 500 334 Q 690 348 756 436" fill="none" stroke="#6b5943" stroke-width="3" />
	<!-- hand-heaped texture strokes on the mound face -->
	{#each [[320, 408, 372, 392], [396, 376, 452, 362], [548, 362, 604, 374], [628, 388, 682, 408]] as [x1, y1, x2, y2], i (i)}
		<path d="M{x1} {y1} Q {(x1 + x2) / 2} {(y1 + y2) / 2 - 6} {x2} {y2}" stroke="#4c3d2c" stroke-width="2" fill="none" opacity="0.7" />
	{/each}
	<!-- ground line left and right of the mound -->
	<path d="M0 436 H 244 M756 436 H 1000" stroke="#6b5943" stroke-width="3" />

	<!-- tubers in cutaway, with feeder roots reaching up to the vines -->
	<g>
		{#each [[446, 502, 40, 20, -14], [530, 512, 46, 22, 7], [478, 552, 30, 16, -28]] as [tx, ty, rx, ry, rot], i (i)}
			<ellipse cx={tx} cy={ty} {rx} {ry} transform="rotate({rot} {tx} {ty})" fill={i === 1 ? '#9c5a36' : '#8a4f30'} stroke="#3a2d1f" stroke-width="1.5" />
		{/each}
		<path d="M500 344 C 496 390 486 440 466 490 M500 344 C 508 400 516 452 528 496 M500 344 C 498 420 488 490 480 540" stroke="#3a2d1f" stroke-width="2" fill="none" opacity="0.8" />
		{#each [[452, 486], [540, 498], [486, 538]] as [hx, hy], i (i)}
			<path d="M{hx} {hy} l -8 10 M{hx} {hy} l 8 12 M{hx} {hy} l 0 14" stroke="#3a2d1f" stroke-width="1.2" fill="none" opacity="0.6" />
		{/each}
	</g>

	<!-- ── the vine canopy: healthy ↔ burned crossfade ─────────────────── -->
	<g opacity={1 - frost}>
		{#each clusters as [cx, cy, s, rot], i (i)}
			<g transform="translate({cx} {cy}) rotate({rot}) scale({s})">
				<path d="M0 0 C -3 -5, -7 -6, -9 -4 C -6 -1, -2 0, 0 0" fill={healthyGreens[i % 3]} />
				<path d="M0 0 C 3 -5, 7 -6, 9 -4 C 6 -1, 2 0, 0 0" fill={healthyGreens[(i + 1) % 3]} />
				<path d="M0 0 C -1 -6, 1 -9, 3 -10 C 4 -7, 2 -2, 0 0" fill={healthyGreens[(i + 2) % 3]} />
			</g>
		{/each}
		<!-- trailing vine stems along the crest -->
		<path d="M296 414 Q 400 352 500 342 Q 604 352 710 402" stroke="#4e6a3a" stroke-width="2.5" fill="none" />
	</g>
	<g opacity={frost}>
		{#each clusters as [cx, cy, s, rot], i (i)}
			<!-- burned leaves droop: nudged down, rotated a little further -->
			<g transform="translate({cx} {cy + 3}) rotate({rot + 6}) scale({s * 0.94})">
				<path d="M0 0 C -3 -4, -7 -5, -9 -3 C -6 0, -2 0, 0 0" fill={burnedBrowns[i % 3]} />
				<path d="M0 0 C 3 -4, 7 -5, 9 -3 C 6 0, 2 0, 0 0" fill={burnedBrowns[(i + 1) % 3]} />
				<path d="M0 0 C -1 -5, 1 -8, 3 -9 C 4 -6, 2 -2, 0 0" fill={burnedBrowns[(i + 2) % 3]} />
			</g>
		{/each}
		<path d="M296 416 Q 400 356 500 346 Q 604 356 710 404" stroke="#3b2f26" stroke-width="2.5" fill="none" />
	</g>

	<!-- ── drought-hardened cracks, opening as the frost phase lands ───── -->
	<g stroke="#241b12" fill="none" stroke-linecap="round" opacity={frost}>
		<path d="M330 420 l 14 -18 l -4 -14 l 12 -12" stroke-width="3" />
		<path d="M560 356 l 12 14 l 14 -6 l 10 16" stroke-width="3" />
		<path d="M660 404 l 16 -10 l 2 -16" stroke-width="2.5" />
		<path d="M120 438 l 22 10 l 18 -6 l 24 12" stroke-width="3" />
		<path d="M820 438 l 26 8 l 16 -8 l 22 10" stroke-width="3" />
	</g>
</svg>

<style>
	.mound-svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
