<script>
	/**
	 * Chapter 1 — the map. Real Natural Earth coastlines of the tropical
	 * Pacific: Papua New Guinea in the west, the Niño 3.4 detection box far
	 * to the east. Five cards animate the ENSO mechanism over it: the two
	 * places, the warm pool in a normal year, El Niño (pool and rain slide
	 * east), La Niña (they pile back west), and why the box reads the change
	 * months before the rain fails at home. The warm-pool motion is a
	 * schematic of the mechanism, drawn over real geography.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyMap from '$lib/components/LazyMap.svelte';
	import { cardIndex } from '$lib/scrolly.js';

	const N = 5;

	const stateLabel = [
		'Map of the tropical Pacific: Papua New Guinea in the west; the Niño 3.4 detection box about 7,500 kilometres east, on the equator.',
		'A normal year: the warm pool — the warmest open ocean on Earth — sits just east of Papua New Guinea, with rain clouds over it.',
		'El Niño: the warm pool and its rain clouds slide east along the equator into the Niño 3.4 box, away from Papua New Guinea.',
		'La Niña: the warm pool and the rain pile back over the far western Pacific, on Papua New Guinea’s doorstep.',
		'The Niño 3.4 box drawn as an instrument: a thermometer in the open ocean that registers the shift months before the rain changes over land.'
	];
</script>

<ChapterHead
	no="Chapter one · the map"
	title="Two patches of one ocean."
	standfirst="Everything in this story happens between two places on this map: Papua New Guinea, and a rectangle of open water on the equator, seven thousand kilometres east. What moves between them is the rain."
/>

<ScrollScene
	id="1-map"
	title="The tropical Pacific: Papua New Guinea and the Niño 3.4 detection region"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_map.json"
>
	{#snippet prose()}
		<h3>The map, in prose</h3>
		<p>
			The tropical Pacific holds the warmest open ocean on Earth — the western warm pool, which
			sits just off Papua New Guinea. Warm water makes rising air, and rising air makes rain, so
			the country's weather rides on that pool. Every few years the pool moves. When it slides
			east along the equator — El Niño — the rain machine travels with it, and Papua New Guinea's
			sky runs dry. When the warmth piles back west — La Niña — the rain comes home, often
			violently. The shift is measured in a rectangle of open ocean called Niño&nbsp;3.4
			(5°N–5°S, 170°W–120°W), seven thousand kilometres east of Port Moresby: sea temperature
			there changes months before the rain does over land, which is why El Niño and La Niña are
			detected there first. The coastlines on the map are real (Natural Earth); the warm-pool
			motion is a drawing of the mechanism, not a measurement.
		</p>
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<div class="graphic">
			<p class="graphic-title">
				THE TROPICAL PACIFIC · coastlines: Natural Earth · the warm pool and its motion: a schematic of the mechanism
			</p>
			{#if data}
				<LazyMap map={data.pacific} {idx} ariaLabel={stateLabel[idx]} />
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">The two places</span>
				<p>
					West, in dark ink: <strong>Papua New Guinea</strong>. East, past the date line: a
					dashed rectangle of open ocean called <span class="hl hl-ink">Niño&nbsp;3.4</span>.
					No land, no towns — just water and weather. Hold both in view.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">Most years</span>
				<p>
					The sea off Papua New Guinea is the warmest open ocean on Earth —
					<span class="hl hl-warm">the warm pool</span>. Warm water lifts the air above it, and
					rising air makes rain. The country's gardens drink from that pool.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">El Niño</span>
				<p>
					Every few years the pool <strong>slides east</strong> along the equator — and the rain
					machine goes with it. Watch it settle into the rectangle. Over Papua New Guinea, the
					sky goes quiet: this is where the <span class="hl hl-warm">droughts</span> come from.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">La Niña</span>
				<p>
					Then the swing back: warmth piles up in the far west, over the country's doorstep, and
					the rain <span class="hl hl-cool">comes home hard</span>. Drought and deluge are the two
					ends of one motion.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 4}>
			<div class="step-card">
				<span class="card-kicker">Why the rectangle matters</span>
				<p>
					The water in Niño&nbsp;3.4 warms <span class="hl hl-ink">months before</span> the rain
					fails over Papua New Guinea. That empty rectangle is an early-warning instrument the
					size of a sea — and reading it is the next chapter.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
