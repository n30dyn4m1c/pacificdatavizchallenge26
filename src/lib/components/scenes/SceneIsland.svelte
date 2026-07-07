<script>
	/**
	 * Chapter 4 — the island, sideways. Opens on the real map of Papua New
	 * Guinea (Natural Earth) with the A–B cut marked, then crossfades to the
	 * elevation profile along that cut and walks it in drought: coast &
	 * islands, the lowland river plains, the Highlands under a dry-season
	 * sun, the same Highlands on a clear night (the frost), and finally the
	 * whole island at once — every altitude pays, each in its own currency.
	 * The profile is an explicitly labelled illustration (vertical scale
	 * exaggerated); the geography under it is real.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyPngMap from '$lib/components/LazyPngMap.svelte';
	import LazyProfile from '$lib/components/LazyProfile.svelte';
	import { cardIndex } from '$lib/scrolly.js';

	const N = 6;

	const profileLabel = [
		'',
		'Elevation profile of Papua New Guinea in drought, coast and offshore islands highlighted: villages by the sea, rain tanks and shallow wells.',
		'The lowland river plains highlighted: rivers drawn low between exposed banks, a barge aground, villages on the plain.',
		'The Highlands highlighted under a drought sun: kaukau gardens on the valley floors and slopes, scorched.',
		'The same Highlands at night under a clear sky: stars out, the day’s heat escaping upward, and the zone above the 2,200-metre frost line frozen by dawn.',
		'The whole profile at once: coast, river plains and Highlands all highlighted — every altitude affected.'
	];
</script>

<ChapterHead
	no="Chapter four · the island"
	title="One drought, every altitude."
	standfirst="Papua New Guinea runs from coral coastlines to 4,500&#8209;metre peaks in the space of a hundred kilometres. Cut the island sideways and walk uphill: an El&nbsp;Niño year reaches every step, and it takes something different from each."
/>

<ScrollScene
	id="4-island"
	title="Papua New Guinea in cross-section: what an El Niño year does at each altitude"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_map.json"
>
	{#snippet prose()}
		<h3>The island, in prose</h3>
		<p>
			Papua New Guinea is not one landscape but a stack of them: island and coastal communities at
			sea level; the great lowland river plains of the Fly and the Sepik, where rivers are the
			roads; the highland valleys around 1,400–2,000 metres, where most of the country's kaukau
			(sweet potato) gardens grow; and the high slopes running up to Mt&nbsp;Wilhelm at 4,509
			metres. An El Niño drought reaches all of it. On the coast and the smaller islands, rain
			tanks and shallow wells fail first. In the lowlands, the rivers themselves drop — in 1997
			and again in 2015 the Fly fell so low that barges stopped, cutting the supply line for
			everything from food to fuel. In the Highlands the same cloudless weather works twice: by
			day the sun scorches gardens that have never needed watering, and at night, with no cloud
			blanket, the ground's heat radiates to space, and gardens above roughly 2,200 metres freeze.
			The cross-section drawn in this chapter is an illustration — the vertical scale is
			exaggerated — but the mechanism at each step is the documented record of 1997 and 2015.
		</p>
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		{@const mapMode = idx === 0}
		<div class="graphic">
			{#if data}
				<div class="stack">
					<div class="layer" style:opacity={mapMode ? 1 : 0} inert={!mapMode}>
						<p class="graphic-title">
							PAPUA NEW GUINEA · coastlines and rivers: Natural Earth · highlands band: illustrative
						</p>
						<LazyPngMap
							map={data.png}
							showCut={true}
							ariaLabel="Map of Papua New Guinea: the mainland with the Fly and Sepik rivers, the highlands band along its spine, and the island provinces — New Britain, New Ireland, Bougainville, Manus. A dashed A–B line cuts from the south coast over Mt Wilhelm to the north coast."
						/>
					</div>
					<div class="layer" style:opacity={mapMode ? 0 : 1} inert={mapMode}>
						<p class="graphic-title">
							THE A–B CUT, SIDEWAYS · an illustration, not a survey · vertical scale exaggerated
						</p>
						<LazyProfile state={Math.max(1, idx)} ariaLabel={profileLabel[Math.max(1, idx)]} />
					</div>
				</div>
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">The country</span>
				<p>
					First, the country itself: a mainland with a wall of mountains down its spine, two great
					rivers draining it, and island provinces scattered across its own sea. Now cut it along
					the dashed line, <strong>A</strong> to <strong>B</strong>, and turn it sideways.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">0 m · coast &amp; islands</span>
				<p>
					Start at the sea. Coastal and island villages drink rain: tanks, shallow wells, small
					streams. In an El Niño year those fail <span class="hl hl-warm">first</span> — and on an
					atoll there is no river to fall back on, only the boat ride to somewhere that still has
					water.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">20 m · the river plains</span>
				<p>
					On the plains, the rivers are the roads. When the Fly drops, the
					<span class="hl hl-cool">barges stop</span> — food, fuel and medicine stop with them,
					and riverside gardens bake in the cracked banks. It happened in 1997; it happened again
					in 2015.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">1,600 m · the Highlands, by day</span>
				<p>
					Climb to the valleys where most of the nation’s kaukau grows. Gardens here have never
					needed watering — the cloud does it. In an El Niño year the cloud is gone: weeks of
					<span class="hl hl-warm">hard sun</span> on thin mountain soil, and the vines wilt.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 4}>
			<div class="step-card">
				<span class="card-kicker">2,200 m · the same day, at night</span>
				<p>
					Now stay on that mountain until midnight. The same cloudless sky that burned the garden
					all day now lets the ground’s heat pour out into space. By dawn, gardens above the
					<span class="hl hl-cool">frost line</span> are silver — and dead. Drought kills by day
					up here, and by night.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 5}>
			<div class="step-card">
				<span class="card-kicker">The whole island</span>
				<p>
					Read the profile end to end: dry tanks at the coast, stranded barges on the plains,
					scorched vines in the valleys, frost on the peaks. <strong>One climate signal, four
					different bills</strong> — and in 1997 and 2015, Papua New Guinea paid all of them in
					the same year.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.stack {
		position: relative;
	}

	.layer {
		transition: opacity 0.6s ease;
	}

	.layer + .layer {
		position: absolute;
		inset: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.layer {
			transition: none;
		}
	}
</style>
