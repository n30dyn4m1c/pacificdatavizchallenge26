<script>
	/**
	 * Chapter 5 — down in the gardens. The national crop-yield record with
	 * the driest years marked, and the honest caveat: subsistence gardens sit
	 * off this ledger. The frost mechanism itself is taken apart in field
	 * note 02, just above this chapter.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import { cardIndex, sweep, runwayVh } from '$lib/scrolly.js';

	const N = 4;

	const figTitle = [
		'The national harvest, 1961–2024',
		'The line stumbles at every one of the driest years',
		'The worst losses never even reach this chart',
		'1997: drought by day, frost by night'
	];
	const fmt0 = (v) => Math.round(v).toLocaleString('en');
</script>

<ChapterHead
	id="ch-5"
	no="Chapter five · the gardens"
	title="What a dry year takes."
	standfirst="A shortfall on a rainfall chart is a shortfall in somebody’s garden. The national harvest record shows where the El&nbsp;Niño years landed — and misses where they landed hardest."
/>

<ScrollScene
	id="5-gardens"
	title="Papua New Guinea crop yield against its driest years, 1961–2024"
	heightVh={runwayVh(N)}
	dataUrl="/data/scene_cost.json"
>
	{#snippet prose({ data })}
		<h3>The gardens, in prose</h3>
		<p>
			The Pacific Community's national crop-yield record for Papua New Guinea (1961–2024) climbs
			across the decades, and stumbles at the driest years — 1982, 1993, 1997 and 2015. The dips
			look modest, and that is itself a finding: most of the country's food grows in subsistence
			gardens a national yield-per-hectare figure barely sees, so the deepest losses sit off this
			ledger. 1997 was the hardest year of the record: drought in the lowlands and frost in the
			Highlands in the same season — the double mechanism the island chapter and its field notes
			describe — brought one of the country's worst food emergencies in living memory.
		</p>
		{#if data}
			<DataTable
				caption="Crop yield (kg/ha) in and around the driest years"
				columns={['Year', 'Crop yield (kg/ha)', 'Driest year?']}
				rows={data.crop.years
					.filter((d) => data.drought_years.some((y) => Math.abs(d.year - y) <= 1))
					.map((d) => [d.year, fmt0(d.value), data.drought_years.includes(d.year) ? 'yes' : ''])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<Figure
			title={figTitle[idx]}
			subtitle="National crop yield, kilograms per hectare, 1961–2024"
			note="Subsistence gardens — most of the country's food — are barely visible in a national yield statistic."
			source="SPC climate-change indicators (CROP_YIELD)"
		>
			{#snippet body({ h })}
				{#if data}
					<LazyLines
						series={[{ key: 'crop', name: 'Crop yield', values: data.crop.years }]}
						markYears={idx >= 1 ? data.drought_years : []}
						progress={sweep(progress, N, 1.2)}
						mode="light"
						unit="kg/ha"
						height={h}
						baseline={null}
						ariaLabel="Line chart of Papua New Guinea national crop yield from 1961 to 2024, climbing overall and dipping around the four driest years, 1982, 1993, 1997 and 2015."
					/>
				{/if}
			{/snippet}
		</Figure>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">1/4</span>
				<span class="card-kicker">The harvest</span>
				<p>
					The national harvest, measured as crop yield from 1961 to 2024. Mostly it climbs:
					better seed, better roads, better prices.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">2/4</span>
				<span class="card-kicker">Mark the dry years</span>
				<p>
					Now mark the four driest years: <strong>1982, 1993, 1997, 2015</strong>. The line
					stumbles at every one.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">3/4</span>
				<span class="card-kicker">What the chart misses</span>
				<p>
					The dips look small. But most of PNG’s food grows in
					<span class="hl hl-ink">subsistence gardens</span> that a national statistic barely
					counts. The worst losses are off this chart — in the villages the field notes just
					described.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-step" aria-hidden="true">4/4</span>
				<span class="card-kicker">1997, twice over</span>
				<p>
					1997 hit twice in one season: <span class="hl hl-warm">drought</span> in the lowlands
					and <span class="hl hl-cool">frost</span> above 2,200 metres. The gardens died — and
					so did the cuttings needed to replant them, which is why the hunger outlasted the
					drought.
				</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
