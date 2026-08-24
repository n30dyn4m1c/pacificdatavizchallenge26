<script>
	/**
	 * Chapter 1½ — the engine beneath. The one scene that leaves the surface:
	 * a dark, full-bleed cross-section of the equatorial Pacific where the
	 * reader literally dives under the map from chapter one and watches the
	 * machine work — the trade winds piling sunlight-warmed water into the
	 * west, the thermocline tilting under it, the Walker circulation lifting
	 * the daily rain off the warm pool — and then stalls (El Niño), over-revs
	 * (La Niña) and hands its gauge to chapter two.
	 *
	 * Everything drawn is mechanism, not measurement — depths are schematic
	 * and the figure says so on its face. The dark surface is the point: it
	 * is the only break in the piece's warm paper, spent on the moment the
	 * story goes underwater.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import EngineSection from '$lib/components/EngineSection.svelte';
	import { cardIndex, runwayVh } from '$lib/scrolly.js';

	const N = 4;

	const figTitle = [
		'The engine, running as usual',
		'El Niño: the winds fail and the warm water slides east',
		'La Niña: the winds strengthen and everything runs harder',
		'One engine, two failure modes — and a gauge that reads them'
	];

	const stateLabel = [
		'Cross-section of the equatorial Pacific in a normal year: trade winds blow along the sea surface from east to west, piling a layer of warm water about 150 metres deep against the western side above a shallow eastern thermocline; air rises off the warm pool carrying daily rain over Papua New Guinea, flows east aloft, and sinks over the eastern Pacific.',
		'El Niño: the trade winds fail and westerly bursts push the warm layer east; the thermocline seesaws — deep in the east, shallow in the west; the rising, rain-bearing branch of the circulation moves to the mid-ocean, and over Papua New Guinea the air sinks: skies clear and the drought begins.',
		'La Niña: the trade winds strengthen beyond normal; more warm water piles in the west, the eastern thermocline shoals further, and the rising rain branch sits harder than ever over Papua New Guinea while the eastern Pacific dries out completely.',
		'The same cross-section at rest: the sloshing of this engine between its El Niño and La Niña states is what the Oceanic Niño Index measures — one number for the position of the engine.'
	];
</script>

<ChapterHead
	id="ch-engine"
	no="Chapter one · continued"
	title="Under the surface, an <span class='hl hl-ink'>engine</span>."
	standfirst="Why does the warm water move? Go below the map: a cross-section of the equatorial Pacific, where the trade winds run a heat engine the width of an ocean — with two failure modes, El&nbsp;Niño and La&nbsp;Niña."
/>

<ScrollScene
	id="1b-engine"
	title="The engine beneath: the equatorial Pacific in cross-section"
	heightVh={runwayVh(N)}
	surface="dark"
>
	{#snippet prose()}
		<h3>The engine, in prose</h3>
		<p>
			Below the map of chapter one sits the machinery. The trade winds blow along the equator
			from South America toward Indonesia, pushing sun-heated surface water ahead of them until
			it piles up in the west — a layer about 150 metres deep sitting on Papua New Guinea's
			doorstep, and the reason the air above it rises and rains nearly every afternoon. East,
			that same wind drags cooler water up from below: the boundary between the warm surface
			layer and the cold deep — the thermocline — reaches almost to the surface.
		</p>
		<p>
			In an El Niño the trades fail, sometimes reversing for weeks. The piled-up warm water
			sloshes back down the equator; the thermocline see-saws — deep in the east, shallow in the
			west — and the rising, rain-making branch of the circulation moves to the middle of the
			basin. Over Papua New Guinea the same rearrangement means sinking air: the daily storms
			switch off, the sky hardens into haze, and the drought of chapter three begins. In a La
			Niña the trades strengthen past normal and every part of the normal year runs harder:
			more rain at home, drier east.
		</p>
		<p>
			This drawing is a schematic of the mechanism — the depths are illustrative, the geography
			is real — but the engine itself is measured: the sloshing of the warm layer is exactly
			what the thermometer of chapter two reads.
		</p>
	{/snippet}

	{#snippet children({ progress })}
		{@const idx = cardIndex(progress, N)}
		<Figure
			fit={1000 / 560}
			title={figTitle[idx]}
			subtitle="The equatorial Pacific in cross-section · west left, east right · vertical scale exaggerated ≈ ×160"
			note="A schematic of the mechanism, not a measurement — depths and arrows are illustrative; the coastlines are real."
			source="After the standard ENSO schematic (NOAA / TAO project)"
		>
			{#snippet body()}
				<EngineSection phase={idx} ariaLabel={stateLabel[idx]} />
			{/snippet}
		</Figure>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">1/{N}</span>
				<span class="card-kicker">Running as usual</span>
				<p>
					The <span class="hl hl-cool">trade winds</span> blow steadily along the equator,
					pushing sun-warmed surface water west until it heaps up against Indonesia and
					<strong>Papua New Guinea</strong> — a warm layer 150&nbsp;m thick. Air rises off it
					every afternoon: PNG’s ordinary rain.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">2/{N}</span>
				<span class="card-kicker">El Niño: the stall</span>
				<p>
					Every few years the trade winds fail — sometimes reversing for weeks. The heaped-up
					warm water <span class="hl hl-warm">slides back east</span>, and the rising,
					rain-making air moves with it to mid-ocean. Over PNG the air <em>sinks</em> instead:
					clear skies, no rain.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">3/{N}</span>
				<span class="card-kicker">La Niña: the opposite</span>
				<p>
					The other failure runs the engine <em>harder</em>: stronger winds, even more warm
					water against PNG, and heavier rain — <span class="hl hl-cool">floods</span> — while
					the eastern Pacific turns bone dry. Same machine, opposite fault.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">4/{N}</span>
				<span class="card-kicker">The gauge on the machine</span>
				<p>
					All of this reduces to one number: how warm the water in the Niño&nbsp;3.4 rectangle
					is, compared with normal. That number has been recorded for over fifty years — and
					it is the next chapter.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
