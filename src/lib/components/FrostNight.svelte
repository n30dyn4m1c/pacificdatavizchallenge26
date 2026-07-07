<script>
	/**
	 * FrostNight — field note two: an interactive illustration of why an El
	 * Niño drought freezes highland gardens at night. Two buttons switch the
	 * same mountain night between "an ordinary night" (cloud blanket, heat
	 * held in, kaukau safe) and "a drought night" (clear sky, the day's heat
	 * radiates to space, the garden frosts by dawn). Explicitly labelled an
	 * illustration of the mechanism — the temperatures are typical values,
	 * not station readings.
	 *
	 * Accessibility: the switch is a real radiogroup; the figure's aria-label
	 * follows the state. Under ?notap=1 the buttons disappear and the figure
	 * freezes on the drought night, so the story still reads.
	 */
	import { ink, impact, surfaces } from '$lib/palette.js';
	import { ui } from '$lib/state.svelte.js';

	const inkC = ink.dark; // the figure is a night scene: dark surface, light ink
	const imp = impact.dark;

	let clearRaw = $state(false);
	const clear = $derived(ui.noTap ? true : clearRaw);

	const STARS = [
		[60, 50], [140, 92], [225, 38], [305, 74], [395, 46], [470, 108],
		[550, 34], [635, 86], [710, 52], [790, 98], [855, 44], [500, 66]
	];

	const label = $derived(
		clear
			? 'A drought night: clear sky, stars out. The day’s heat streams from the ground straight up to space; the thermometer reads minus 3 degrees by dawn and the kaukau vines above the frost line are frozen.'
			: 'An ordinary night: a blanket of cloud over the mountain. The ground’s heat rises, meets the cloud, and much of it is sent back down; the thermometer reads plus 9 degrees by dawn and the kaukau vines are safe.'
	);
</script>

<section class="fieldnote" aria-label="Field note: how a clear night kills a garden">
	<header>
		<p class="kicker">Field note 02 · the frost</p>
		<h3>How a clear night kills a garden.</h3>
		<p class="lede">
			Kaukau — sweet potato — is the staple food of the Highlands, and it grows to well past 2,200
			metres. It survives up there because cloud works as a blanket. Take the cloud away and watch
			the same night twice. <em>(An illustration of the mechanism; typical values, not station
			readings.)</em>
		</p>
	</header>

	{#if !ui.noTap}
		<div class="switch" role="radiogroup" aria-label="Choose the night">
			<button class="beat-pill" role="radio" aria-checked={!clear} onclick={() => (clearRaw = false)}>
				☁ an ordinary night
			</button>
			<button class="beat-pill" role="radio" aria-checked={clear} onclick={() => (clearRaw = true)}>
				✳ a drought night
			</button>
		</div>
	{/if}

	<figure>
		<svg viewBox="0 0 900 430" role="img" aria-label={label}>
			<!-- night sky -->
			<rect width="900" height="430" rx="8" fill={surfaces.ocean} />

			<!-- stars: only a clear sky shows them -->
			<g style="transition: opacity 0.7s" opacity={clear ? 1 : 0}>
				{#each STARS as [sx, sy], i (i)}
					<circle cx={sx} cy={sy} r={i % 3 === 0 ? 1.9 : 1.2} fill={inkC.primary} />
				{/each}
			</g>
			<text x="874" y="40" text-anchor="end" font-size="13" font-weight="700" fill={clear ? inkC.secondary : inkC.muted} style="transition: fill 0.7s">
				{clear ? 'space: nothing holds the heat' : ''}
			</text>

			<!-- the cloud blanket -->
			<g class="cloud" style:opacity={clear ? 0 : 1}>
				{#each [[120, 96], [305, 82], [490, 98], [665, 84], [820, 96]] as [cx, cy] (cx)}
					<ellipse {cx} {cy} rx="120" ry="30" fill={ink.dark.grid} />
					<ellipse cx={cx + 40} cy={cy - 16} rx="80" ry="24" fill={ink.dark.grid} />
				{/each}
				<text x="450" y="96" text-anchor="middle" font-size="13" font-weight="700" fill={inkC.secondary}>
					cloud — the blanket
				</text>
			</g>

			<!-- heat leaving the ground -->
			<g stroke={imp.drought} stroke-width="2.4" stroke-linecap="round" fill="none">
				{#each [260, 450, 640] as hx (hx)}
					{#if clear}
						<!-- straight out, all the way up -->
						<path class="heat" d="M{hx} 300 q8 -30 0 -60 q-8 -30 0 -60 q8 -30 0 -60 q-8 -30 0 -55" />
					{:else}
						<!-- up to the cloud, then turned back down -->
						<path class="heat" d="M{hx} 300 q8 -30 0 -60 q-8 -30 0 -60 q6 -22 -2 -44" />
						<path class="heat back" d="M{hx + 26} 140 q-8 26 0 52 q8 26 0 52 q-6 22 2 44" />
					{/if}
				{/each}
			</g>

			<!-- the mountainside with its kaukau mounds -->
			<path d="M0 430L0 330 Q220 292 450 300 Q690 308 900 336 L900 430Z" fill={ink.dark.axis} />
			{#each [110, 200, 290, 380, 470, 560, 650, 740, 830] as gx, i (gx)}
				{@const gy = 318 + (i % 3) * 4 - Math.floor(Math.abs(450 - gx) / 60)}
				<path d="M{gx - 9} {gy} a9 9 0 0 1 18 0Z" fill={ink.dark.grid} />
				<!-- the vines: safe ink on an ordinary night, frost-silver on a clear one -->
				<g stroke={clear ? imp.frost : inkC.secondary} stroke-width="2.2" stroke-linecap="round" fill="none" style="transition: stroke 0.7s">
					<path d="M{gx} {gy - 9} q-4 -8 -1 -13 M{gx} {gy - 9} q5 -6 9 -7" />
				</g>
			{/each}
			{#if clear}
				<g class="fade-in">
					{#each [150, 340, 520, 700, 860] as fx (fx)}
						<text x={fx} y="306" font-size="11" fill={imp.frost}>✳</text>
					{/each}
					<text x="450" y="376" text-anchor="middle" font-size="14" font-weight="800" fill={imp.frost}>
						by dawn: frost — the vines are dead, and so are the cuttings for next season
					</text>
				</g>
			{:else}
				<text x="450" y="376" text-anchor="middle" font-size="14" font-weight="700" fill={inkC.secondary}>
					by dawn: mist on a warm garden
				</text>
			{/if}

			<!-- thermometer -->
			<g transform="translate(52 160)">
				<rect x="-7" y="-60" width="14" height="120" rx="7" fill={surfaces.oceanRaised} stroke={inkC.secondary} stroke-width="1.6" />
				<circle cx="0" cy="74" r="15" fill={clear ? imp.frost : imp.drought} style="transition: fill 0.7s" />
				<!-- fixed-geometry column scaled from its base, so the level animates -->
				<rect
					class="mercury"
					x="-3.5"
					y="-34"
					width="7"
					height="102"
					rx="3.5"
					fill={clear ? imp.frost : imp.drought}
					style:transform="scaleY({clear ? 0.3 : 1})"
				/>
				<text x="24" y="-28" font-size="13" fill={inkC.muted}>+10°</text>
				<text x="24" y="34" font-size="13" fill={inkC.muted}>0°</text>
				<text x="24" y="82" font-size="16" font-weight="800" fill={clear ? imp.frost : imp.drought} style="transition: fill 0.7s">
					{clear ? '−3 °C' : '+9 °C'}
				</text>
				<text x="0" y="112" text-anchor="middle" font-size="11" fill={inkC.muted}>at dawn</text>
			</g>
		</svg>
	</figure>

	<p class="post">
		That is why 1997 and 2015 hurt twice at altitude: the drought browned the gardens by day, and
		its cloudless nights froze what was left — killing the planting material for the next crop with
		it. The frost didn’t follow the drought; it <em>was</em> the drought, seen at 2 a.m.
	</p>
</section>

<style>
	.fieldnote {
		max-width: 62rem;
		margin: 0 auto;
		padding: clamp(3.5rem, 9vh, 6rem) 1.5rem;
	}

	header {
		max-width: 44rem;
	}

	h3 {
		font-size: clamp(1.6rem, 4.5vw, 2.4rem);
		margin-bottom: 0.35em;
	}

	.lede {
		color: var(--ink-light-secondary);
	}

	.switch {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		margin: 1rem 0 1.25rem;
	}

	.switch .beat-pill[aria-checked='true'] {
		border-color: var(--beat-accent);
		background: color-mix(in srgb, var(--beat-accent) 14%, var(--beat-surface));
	}

	figure {
		margin: 0;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.cloud {
		transition: opacity 0.7s ease;
	}

	.heat {
		stroke-dasharray: 6 9;
		animation: heat-rise 1.4s linear infinite;
	}

	.heat.back {
		animation-direction: reverse;
	}

	.mercury {
		transform-box: fill-box;
		transform-origin: center bottom;
		transition: transform 0.7s ease, fill 0.7s;
	}

	@keyframes heat-rise {
		to {
			stroke-dashoffset: -15;
		}
	}

	.fade-in {
		animation: fade-in 0.7s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	.post {
		max-width: 44rem;
		margin-top: 1.25rem;
		color: var(--ink-light-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.heat {
			animation: none;
		}

		.cloud,
		.mercury {
			transition: none;
		}

		.fade-in {
			animation: none;
		}
	}
</style>
