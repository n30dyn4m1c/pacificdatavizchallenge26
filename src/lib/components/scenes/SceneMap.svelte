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
	import Figure from '$lib/components/Figure.svelte';
	import LazyMap from '$lib/components/LazyMap.svelte';
	import { cardIndex, runwayVh } from '$lib/scrolly.js';

	const N = 5;

	// below this figure width the full 2.5:1 basin is unreadably short, and
	// the map crops to the stretch the story actually uses (see PacificMap)
	const NARROW_PX = 760;

	// the figure title follows the card: a chart's headline should say what
	// the reader is looking at right now, not describe the file it came from
	const figTitle = [
		'Two places, seven thousand kilometres apart',
		'A normal year: warm water — and rain — on PNG’s doorstep',
		'El Niño: the warm water and the rain move east',
		'La Niña: the warm water piles back west',
		'An empty rectangle that reads the future'
	];

	const stateLabel = [
		'Map of the tropical Pacific: Papua New Guinea in the west; the Niño 3.4 detection box about 7,500 kilometres east, on the equator.',
		'A normal year: the warm pool — the warmest open ocean on Earth — sits just east of Papua New Guinea, with rain clouds over it.',
		'El Niño: the warm pool and its rain clouds slide east along the equator into the Niño 3.4 box, away from Papua New Guinea.',
		'La Niña: the warm pool and the rain pile back over the far western Pacific, on Papua New Guinea’s doorstep.',
		'The Niño 3.4 box drawn as an instrument: a thermometer in the open ocean that registers the shift months before the rain changes over land.'
	];
</script>

<ChapterHead
	id="ch-1"
	no="Chapter one · the map"
	title="The rain’s switch sits an ocean away."
	standfirst="Two places on this map run Papua New Guinea’s weather: the country itself, and a rectangle of open water on the equator, seven thousand kilometres east. What moves between them is the rain."
/>

<ScrollScene
	id="1-map"
	title="The tropical Pacific: Papua New Guinea and the Niño 3.4 detection region"
	heightVh={runwayVh(N)}
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
		<Figure
			wide={true}
			fit={(w) => (w < NARROW_PX ? 700 / 393.4 : 1000 / 393.4)}
			title={figTitle[idx]}
			subtitle="The tropical Pacific, equator centred · Papua New Guinea west, the Niño&nbsp;3.4 detection box east"
			note="The warm pool and its motion are a schematic of the mechanism, not a measurement."
			source="Coastlines: Natural Earth"
		>
			{#snippet body({ w })}
				{#if data}
					<LazyMap
						map={data.pacific}
						{idx}
						narrow={w < NARROW_PX}
						ariaLabel={stateLabel[idx]}
					/>
				{/if}
			{/snippet}
		</Figure>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">1/5</span>
				<span class="card-kicker">The two places</span>
				<p>
					West, in dark ink: <strong>Papua New Guinea</strong>. East, past the date line: a
					dashed rectangle of open ocean called <span class="hl hl-ink">Niño&nbsp;3.4</span>.
					No land, no towns — just water. But that water decides PNG’s weather.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">2/5</span>
				<span class="card-kicker">Most years</span>
				<p>
					The sea next to PNG is the warmest open ocean on Earth. Warm water lifts the air
					above it, and rising air makes rain. That is where the country’s
					<span class="hl hl-cool">rain</span> comes from.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">3/5</span>
				<span class="card-kicker">El Niño</span>
				<p>
					Every few years the warm water <strong>slides east</strong> along the equator — and
					the rain goes with it, into the rectangle. Over Papua New Guinea the sky dries out.
					That is an El Niño: the start of PNG’s
					<span class="hl hl-warm">droughts</span>.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">4/5</span>
				<span class="card-kicker">La Niña</span>
				<p>
					Then the ocean swings back. Warm water piles up against PNG again, and the rain
					returns — often <span class="hl hl-cool">too much of it</span>. Drought and flood are
					the two ends of the same swing.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 4}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">5/5</span>
				<span class="card-kicker">Why the rectangle matters</span>
				<p>
					The water in Niño&nbsp;3.4 warms <span class="hl hl-ink">months before</span> the rain
					fails over Papua New Guinea. So PNG’s droughts are never a surprise — they are
					announced, far out at sea, with time to prepare.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
