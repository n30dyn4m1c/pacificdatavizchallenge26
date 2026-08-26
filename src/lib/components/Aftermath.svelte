<script>
	/**
	 * Aftermath — the swing back. El Niño's ending is not relief but a second
	 * hazard: the see-saw tips toward La Niña, the rain returns hard onto
	 * slopes the drought has bared (gardens dead, ground burnt and baked),
	 * and the year of hunger becomes a season of floods and landslips. The
	 * documented case in the prose is the 2016 Wahgi valley (Jiwaka) floods
	 * and landslides, straight after the 2015–16 drought. The hillside is an
	 * explicitly labelled illustration.
	 */
	import { onMount } from 'svelte';
	import { ink, impact, surfaces } from '$lib/palette.js';
	import { reveal } from '$lib/reveal.js';

	const inkC = ink.light;
	const imp = impact.light;

	// deterministic rain field, same trick as the hero
	const RAIN = Array.from({ length: 26 }, (_, i) => {
		const h = (i * 2654435761) % 1000;
		return { x: 20 + i * 34 + (h % 14), delay: -(h % 500) / 250, len: 16 + (h % 12) };
	});

	// the rain field is infinite CSS motion: run it only while the figure is
	// on screen (paused off-screen), and never under reduced motion
	let fig = $state(null);
	let on = $state(false);
	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const io = new IntersectionObserver(([e]) => (on = e.isIntersecting), { threshold: 0.15 });
		if (fig) io.observe(fig);
		return () => io.disconnect();
	});
</script>

<section id="ch-aftermath" class="aftermath" aria-label="The aftermath: floods and landslides when the rain returns">
	<header class="chapter-head">
		<p class="chapter-no" use:reveal>Interlude · the aftermath</p>
		<h2 use:reveal={{ delay: 90 }}>The drought ends in water.</h2>
		<p class="standfirst" use:reveal={{ delay: 200 }}>
			The end of an El&nbsp;Niño is its own disaster. The rain returns all at once, onto slopes
			the drought has stripped bare — and brings floods and landslides.
		</p>
	</header>

	<figure bind:this={fig}>
		<svg viewBox="0 0 900 380" role="img" aria-label="Illustration of a highland hillside just after a drought breaks: heavy rain falling on bare slopes, a landslip scarring the hillside, and a river flooding the gardens and houses along its banks.">
			<rect width="900" height="380" rx="8" fill="color-mix(in srgb, {imp.frost} 10%, {surfaces.paper})" />

			<!-- the returning rain -->
			<g class="rainfield" class:on stroke={imp.frost} stroke-width="2" stroke-linecap="round" opacity="0.75">
				{#each RAIN as d (d.x)}
					<line class="rain" x1={d.x} y1="-20" x2={d.x - 6} y2={-20 + d.len} style="animation-delay: {d.delay}s" />
				{/each}
			</g>

			<!-- the hillside, bare after the drought -->
			<path d="M0 380L0 96 Q170 118 320 176 Q520 252 900 292 L900 380Z" fill={inkC.grid} stroke={inkC.axis} stroke-width="1.2" />

			<!-- dead gardens the drought left -->
			<g stroke={imp.drought} stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8">
				<path d="M120 118 l0 -12 M150 128 l0 -12 M186 140 l0 -12 M222 152 l0 -12" />
			</g>
			<text x="118" y="94" font-size="12" font-weight="600" fill={imp.drought}>bare, baked slopes</text>

			<!-- the landslip -->
			<path d="M320 176 Q400 210 470 234 L500 258 Q420 240 348 208 Z" fill="color-mix(in srgb, {imp.drought} 45%, {surfaces.paper})" stroke={imp.drought} stroke-width="1.4" />
			<g fill={imp.drought}>
				<circle cx="486" cy="252" r="5" />
				<circle cx="508" cy="266" r="7" />
				<circle cx="532" cy="278" r="4.5" />
			</g>
			<text x="380" y="196" font-size="13" font-weight="800" fill={imp.drought}>landslip</text>

			<!-- the flooded valley floor -->
			<rect x="470" y="300" width="430" height="80" fill="color-mix(in srgb, {imp.frost} 48%, {surfaces.paper})" />
			<path d="M470 300 Q560 292 640 300 Q740 308 900 298 L900 306 Q740 316 640 308 Q560 300 470 308 Z" fill={imp.frost} opacity="0.55" />
			<!-- houses in the water -->
			<g fill={inkC.primary}>
				<path d="M600 302L614 284L628 302Z" />
				<path d="M636 304L650 286L664 304Z" />
				<path d="M760 300L774 282L788 300Z" />
			</g>
			<text x="600" y="342" font-size="13" font-weight="800" fill="color-mix(in srgb, {imp.frost} 70%, {inkC.primary})">
				the river takes the gardens back
			</text>
		</svg>
		<figcaption>An illustration of the mechanism — not a survey of any one valley.</figcaption>
	</figure>

	<div class="aftermath-prose">
		<p>
			A drought kills the ground cover and bakes the soil hard. Hungry families move their
			gardens down into the riverbeds — the only damp land left. Then the ocean swings back. When
			the 2015–16 El Niño broke, the Wahgi valley in Jiwaka Province went almost straight from
			drought into
			<a href="https://reliefweb.int/report/papua-new-guinea/floods-and-landslides-follow-drought-png-highlands"
				rel="external noopener">floods and landslides that hit around five thousand households</a>
			— the same communities that had just spent a year hungry.
		</p>
		<p>
			So an El Niño year is paid for twice: once in the drought, once when it ends. The
			prepared response is known too — plant the flood-safe ground first, keep drains and slopes
			clear through the dry, and treat the first big rain as a warning, not a celebration.
		</p>
	</div>
</section>

<style>
	.aftermath {
		max-width: 62rem;
		margin: 0 auto;
		padding: clamp(3.5rem, 9vh, 6rem) 1.5rem;
	}

	figure {
		margin: 0;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	figcaption {
		font-size: 0.75rem;
		color: var(--ink-light-muted);
		margin-top: 0.4rem;
	}

	.rain {
		animation: aftermath-fall 1.6s linear infinite;
		animation-play-state: paused; /* off-screen the field does no work */
	}

	.rainfield.on .rain {
		animation-play-state: running;
	}

	@keyframes aftermath-fall {
		to {
			transform: translateY(410px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rain {
			animation: none;
			transform: translateY(180px);
		}
	}

	.aftermath-prose {
		max-width: 44rem;
		margin: 1.75rem auto 0;
	}
</style>
