<script>
	/**
	 * Chapter 3 — down in the gardens. The national crop-yield record with
	 * the driest years marked; the honest caveat (subsistence gardens sit off
	 * this ledger) and the 1997 frost story as an explicitly-labelled
	 * illustrative popup inside the last card.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import TapReveal from '$lib/components/beats/TapReveal.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, sweep } from '$lib/scrolly.js';

	const N = 4;
	const fmt0 = (v) => Math.round(v).toLocaleString('en');
</script>

<ChapterHead
	no="Chapter three · the gardens"
	title="What a dry year takes."
	standfirst="A shortfall on a rainfall chart is a shortfall in somebody’s garden. The national harvest record shows where the El&nbsp;Niño years landed — and hides where they landed hardest."
/>

<ScrollScene
	id="3-gardens"
	title="Papua New Guinea crop yield against its driest years, 1961–2024"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_cost.json"
>
	{#snippet prose({ data })}
		<h3>The gardens, in prose</h3>
		<p>
			The Pacific Community's national crop-yield record for Papua New Guinea (1961–2024) climbs
			across the decades, and stumbles at the driest years — 1982, 1993, 1997 and 2015. The dips
			look modest, and that is itself a finding: most of the country's food grows in subsistence
			gardens a national yield-per-hectare figure barely sees, so the deepest losses sit off this
			ledger. 1997 was the cruellest year: drought below and frost above, because an El Niño
			drought's clear, dry skies let highland nights radiate their heat to space, and gardens
			above 2,200 metres died in a single night. (The frost mechanism is described as an
			illustration — it carries no numbers from this dataset.)
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
		<div class="graphic">
			<p class="graphic-title">
				NATIONAL CROP YIELD · kg per hectare, 1961–2024 · driest years marked
			</p>
			{#if data}
				<LazyLines
					series={[{ key: 'crop', name: 'Crop yield', accent: true, values: data.crop.years }]}
					markYears={idx >= 1 ? data.drought_years : []}
					progress={sweep(progress, N, 1.2)}
					mode="light"
					unit="kg/ha"
					height={430}
					baseline={null}
					ariaLabel="Line chart of Papua New Guinea national crop yield from 1961 to 2024, climbing overall and dipping around the four driest years, 1982, 1993, 1997 and 2015."
				/>
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">The harvest</span>
				<p>
					So what does a dry year actually take? Here is the national harvest — crop yield, 1961
					to 2024. Mostly it climbs: better seed, better roads, better prices.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">Mark the dry years</span>
				<p>
					Now mark the four driest years: <strong>1982, 1993, 1997, 2015</strong>. The line
					stumbles at every one.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">The honest caveat</span>
				<p>
					The dips look small. Don’t be fooled: most of Papua New Guinea’s food grows in
					<span class="hl hl-ink">subsistence gardens</span> that a national statistic barely
					sees. The hardest losses land off this chart.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">1997, the cruellest</span>
				<p>
					1997 hit twice: drought below, and <span class="hl hl-cool">frost</span> above. An El
					Niño drought’s clear, dry skies let highland nights freeze — gardens above 2,200 metres
					died in a single night.
				</p>
				<TapReveal id="gardens-frost" label="How a clear night kills a garden →">
					<h3>The frost story <em>(an illustration, not a measurement)</em></h3>
					<p>
						Kaukau — sweet potato — is the staple of the Highlands, grown on mounded gardens up
						to and past 2,200 metres. Cloud is a blanket; in an El Niño drought there is none.
						The ground radiates the day’s heat straight to space, and by dawn a garden that
						normally never freezes is silver with frost.
					</p>
					<p>
						One such night blackens the vines. The tubers below survive, but nothing feeds them —
						and the cuttings needed to replant died in the same hour, so the loss reaches into
						the next season. In 1997, drought and frost together brought one of the country’s
						worst food emergencies in living memory.
					</p>
				</TapReveal>
			</div>
		</div>
	{/snippet}
</ScrollScene>
