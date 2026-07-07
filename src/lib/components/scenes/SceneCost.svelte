<script>
	/**
	 * Act V — The cost. Papua New Guinea's national crop-yield record
	 * (1961–2024) with the four driest rainfall years marked. At the national
	 * annual scale the dips are modest — most food here is grown in
	 * subsistence gardens the yield statistic barely sees — but the drought
	 * years still register. The human mechanism (highland frost on a clear
	 * drought night) lives in an explicitly-labelled illustrative popup, not
	 * a scene. Real SPC record (static/data/scene_cost.json).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import TapReveal from '$lib/components/beats/TapReveal.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.04, 0.24], text: 'A verdict on paper is a shortage in a garden.' },
		{ at: [0.24, 0.46], text: 'Against national crop yield, the El Niño years leave their mark.' },
		{ at: [0.46, 0.68], text: 'The dips look modest — most food grows in gardens this statistic barely sees.', sub: 'The deepest losses, in the highland kaukau mounds, sit off the national ledger.' },
		{ at: [0.68, 0.86], text: 'And an El Niño drought carries a second knife: frost.', sub: 'Clear, dry nights let highland gardens freeze — the story is in the popup.' },
		{ at: [0.86, 1], text: 'The number that matters is the one a family cannot eat.' }
	];

	const fmt0 = (v) => Math.round(v).toLocaleString('en');
</script>

<ScrollScene
	id="5-cost"
	title="The cost — Papua New Guinea crop yield against its driest years, 1961–2024"
	heightVh={560}
	surface="dark"
	dataUrl="/data/scene_cost.json"
>
	{#snippet prose({ data })}
		<h2>Exhibit E: the cost</h2>
		<p>
			What an El Niño year takes. The Pacific Community's national crop-yield record for Papua New
			Guinea (1961–2024) is shown with the four driest years — 1997, 2015, 1993 and 1982 — marked.
			Against those years the yield line dips, though modestly: most food in Papua New Guinea is
			grown in subsistence gardens that a national yield-per-hectare figure barely captures, so
			the deepest losses sit largely off this ledger. An El Niño drought also carries a second
			blow the annual statistic cannot show: under the clear, dry skies of a drought the highland
			nights turn cold, and gardens above 2,200 metres can be killed by frost in a single night —
			as they were, together with the drought, in 1997.
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
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · national crop yield (kg/ha), driest years marked</p>
				<h2 class="display">The cost.</h2>
			</header>
			{#if data}
				<LazyLines
					series={[{ key: 'crop', name: data.crop.name, accent: true, values: data.crop.years }]}
					markYears={data.drought_years}
					{progress}
					mode="dark"
					unit="kg/ha"
					height={340}
					baseline={null}
					ariaLabel="Line chart of Papua New Guinea national crop yield in kilograms per hectare from 1961 to 2024, with the four driest rainfall years (1997, 2015, 1993, 1982) marked. Yield dips modestly around those years."
				/>
			{/if}
			<div class="steps-row">
				<SceneSteps {steps} {progress} width="32rem" />
				<div class="reveal-slot" class:hidden={progress <= 0.68} inert={progress <= 0.68}>
					<TapReveal id="cost-garden" label="One garden, one clear night →">
						<h3>The frost story <em>(an illustration, not a measurement)</em></h3>
						<p>
							Kaukau — sweet potato — is the staple of the Highlands, grown on mounded gardens up
							to and past 2,200 metres. In an El Niño drought the skies clear, and it is the clear
							nights that kill: with no cloud for a blanket, the ground radiates the day's heat
							straight out to space, and a garden that normally never freezes is silver with frost
							by dawn.
						</p>
						<p>
							One such night blackens the vines. The tubers below survive, but nothing feeds them
							now — and the cuttings needed to replant died in the same hour, so the loss reaches
							into the next season. In 1997, drought and frost arrived together, and the highlands
							faced one of the country's worst food emergencies in living memory. This card
							describes a well-understood mechanism (radiative frost); it carries no data claim.
						</p>
					</TapReveal>
				</div>
			</div>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.wrap {
		height: 100%;
		max-width: 64rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.75rem;
	}

	h2.display {
		font-size: clamp(1.8rem, 5vw, 3rem);
		margin-bottom: 0;
	}

	.steps-row {
		min-height: 6.5rem;
		display: flex;
		align-items: flex-start;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.reveal-slot {
		transition: opacity 0.4s;
	}

	.reveal-slot.hidden {
		opacity: 0;
		pointer-events: none;
	}
</style>
