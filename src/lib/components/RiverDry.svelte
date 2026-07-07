<script>
	/**
	 * RiverDry — field note one: an interactive illustration of a lowland
	 * river falling through an El Niño dry spell. A slider sets "months
	 * without real rain" (0–6); the water drops past four thresholds and the
	 * consequences arrive in order: sandbars, stranded barges, dry pumps,
	 * the long walk for water. Everything here is an explicitly labelled
	 * illustration of the documented 1997/2015 mechanism (the Fly River
	 * barge closures), not a gauge record.
	 *
	 * Accessibility: the slider is a real <input type=range> with
	 * aria-valuetext; the consequence list is ordinary text, always in the
	 * DOM. Under ?notap=1 the control disappears and the figure freezes at
	 * the full-drought state so the story still reads.
	 */
	import { ink, impact, surfaces } from '$lib/palette.js';
	import { ui } from '$lib/state.svelte.js';

	const inkC = ink.light;
	const imp = impact.light;

	let monthsRaw = $state(0);
	const months = $derived(ui.noTap ? 6 : monthsRaw);

	// water surface: normal season y=252 → month six y=322 (bed at ~330)
	const level = $derived(252 + (322 - 252) * (months / 6));
	const grounded = $derived(months >= 3);

	const STAGES = [
		{ at: 1, text: 'Sandbars surface mid-channel. The deep-draft barges begin to wait for water that isn’t coming.' },
		{ at: 3, text: 'The barges stop. On the Fly this is the whole supply line — food, fuel, medicine — and in 1997 and 2015 it stayed shut for months.' },
		{ at: 4, text: 'Pump intakes and shallow wells now sit above the water. The river you can see is water you can’t reach.' },
		{ at: 5, text: 'Waterholes go bad, and fetching water becomes hours of every day — time that used to be gardening, school, work.' }
	];

	const valuetext = $derived(
		months === 0
			? 'Normal season: the river is full and barges are running.'
			: `${months} month${months > 1 ? 's' : ''} without real rain. ` +
				STAGES.filter((s) => months >= s.at).map((s) => s.text).join(' ')
	);
</script>

<section class="fieldnote" aria-label="Field note: how a river dries">
	<header>
		<p class="kicker">Field note 01 · the rivers</p>
		<h3>How a river dries.</h3>
		<p class="lede">
			In the lowlands the river is the road, the market and the water supply at once. Move the dry
			season along and watch what fails, in the order it failed in 1997 and 2015.
			<em>(An illustration of the mechanism, not a gauge record.)</em>
		</p>
	</header>

	<div class="figure-row">
		<figure>
			<svg viewBox="0 0 900 420" role="img" aria-label="Cross-section of a lowland river between two banks. {valuetext}">
				<rect width="900" height="420" rx="8" fill="color-mix(in srgb, {imp.frost} 5%, {surfaces.paper})" />

				<!-- normal-season water line, left as a mark on the bank -->
				<line x1="120" x2="780" y1="252" y2="252" stroke={imp.frost} stroke-width="1.2" stroke-dasharray="3 5" opacity="0.55" />
				<text x="126" y="246" font-size="12" fill={inkC.muted}>normal season</text>

				<!-- water: a fixed body sliding down inside the channel clip, so the
				     level animates with a plain (GPU-friendly) transform -->
				<clipPath id="riverdry-channel">
					<path d="M150 250 L750 250 L750 331 Q450 349 150 331 Z" />
				</clipPath>
				<g clip-path="url(#riverdry-channel)">
					<rect
						class="water"
						x="150"
						y="252"
						width="600"
						height="110"
						style:transform="translateY({(level - 252).toFixed(0)}px)"
						fill="color-mix(in srgb, {imp.frost} 55%, {surfaces.paper})"
					/>
				</g>

				<!-- banks -->
				<path d="M0 420L0 200 Q60 205 110 226 Q150 244 150 331 Q450 349 750 331 Q750 240 800 222 Q850 206 900 202 L900 420 Z"
					fill={inkC.grid} stroke={inkC.axis} stroke-width="1.2" />

				<!-- exposed bed cracks once the water is low -->
				{#if months >= 4}
					<g class="fade-in" stroke={inkC.secondary} stroke-width="1.4" opacity="0.6">
						<path d="M240 328 l14 5 M262 334 l12 -4 M600 330 l14 4 M640 328 l12 5" fill="none" />
					</g>
				{/if}

				<!-- village: huts + rain tank on the left bank -->
				<g fill={inkC.primary}>
					<path d="M40 200L55 182L70 200Z" />
					<path d="M74 200L89 182L104 200Z" />
					<rect x="112" y="188" width="14" height="14" rx="2" fill="none" stroke={inkC.primary} stroke-width="2.4" />
				</g>
				<text x="40" y="172" font-size="13" font-weight="700" fill={inkC.primary}>village</text>

				<!-- pump intake on the right bank: a pipe reaching to a fixed depth -->
				<g stroke={inkC.primary} stroke-width="3" fill="none">
					<path d="M800 222 L800 292 L788 296" />
				</g>
				<text x="810" y="240" font-size="12" font-weight="600" fill={months >= 4 ? imp.drought : inkC.secondary}>
					{months >= 4 ? 'pump: dry' : 'pump intake'}
				</text>

				<!-- the barge: floats on the surface until the river lets go of it -->
				<g class="barge" style:transform="translate(430px, {grounded ? 318 : level - 9}px) rotate({grounded ? 7 : 0}deg)">
					<rect x="-42" y="0" width="84" height="16" rx="3" fill={inkC.primary} />
					<rect x="-14" y="-14" width="26" height="14" rx="2" fill={inkC.primary} />
				</g>
				{#if grounded}
					<text class="fade-in" x="430" y="296" text-anchor="middle" font-size="13" font-weight="800" fill={imp.drought}>
						aground
					</text>
				{/if}

				<!-- riverside garden on the right slope -->
				<g stroke={months >= 3 ? imp.drought : inkC.secondary} stroke-width="2.4" stroke-linecap="round" fill="none" style="transition: stroke 0.5s">
					<path d="M840 200 q-3 -12 2 -18 M840 200 q7 -8 12 -8" />
					<path d="M864 198 q-3 -12 2 -18 M864 198 q7 -8 12 -8" />
				</g>
				<text x="836" y="180" font-size="12" font-weight="600" fill={months >= 3 ? imp.drought : inkC.secondary}>
					garden
				</text>
			</svg>
		</figure>

		<div class="consequences">
			{#each STAGES as s, i (s.at)}
				<div class="cq" class:on={months >= s.at}>
					<span class="cq-no">{i + 1}</span>
					<p>{s.text}</p>
				</div>
			{/each}
		</div>
	</div>

	{#if !ui.noTap}
		<div class="control">
			<label for="river-months">
				Months without real rain: <strong>{months}</strong>
			</label>
			<input
				id="river-months"
				type="range"
				min="0"
				max="6"
				step="1"
				bind:value={monthsRaw}
				aria-valuetext={valuetext}
			/>
			<div class="range-ends" aria-hidden="true"><span>normal season</span><span>six months dry</span></div>
		</div>
	{/if}
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

	.figure-row {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(15rem, 1fr);
		gap: 1.5rem;
		align-items: start;
		margin-top: 1.5rem;
	}

	@media (max-width: 760px) {
		.figure-row {
			grid-template-columns: 1fr;
		}
	}

	figure {
		margin: 0;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.water {
		transition: transform 0.6s ease;
	}

	.barge {
		transition: transform 0.6s ease;
	}

	.fade-in {
		animation: fade-in 0.5s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	.consequences {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.cq {
		display: flex;
		gap: 0.7rem;
		align-items: baseline;
		padding: 0.55rem 0.75rem;
		border-radius: 10px;
		border: 1px solid var(--ink-light-grid);
		background: var(--paper-raised);
		opacity: 0.45;
		transition: opacity 0.35s, border-color 0.35s;
		font-size: 0.88rem;
		line-height: 1.45;
	}

	.cq.on {
		opacity: 1;
		border-color: color-mix(in srgb, var(--warm) 55%, transparent);
	}

	.cq p {
		margin: 0;
	}

	.cq-no {
		font-family: Fraunces, Georgia, serif;
		font-weight: 900;
		font-size: 1.05rem;
		color: var(--warm);
	}

	.control {
		margin-top: 1.25rem;
		max-width: 34rem;
	}

	.control label {
		display: block;
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.4rem;
	}

	.control input[type='range'] {
		width: 100%;
		accent-color: var(--warm);
		min-height: 44px; /* tap-target floor */
		cursor: pointer;
	}

	.range-ends {
		display: flex;
		justify-content: space-between;
		font-size: 0.72rem;
		color: var(--ink-light-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.water,
		.barge {
			transition: none;
		}

		.fade-in {
			animation: none;
		}
	}
</style>
