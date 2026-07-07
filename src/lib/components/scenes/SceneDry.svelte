<script>
	/**
	 * Act II — The dry years. A pinned annual bar chart of Papua New Guinea's
	 * rainfall anomaly, 1979–2025: the crime the piece investigates. The five
	 * deepest shortfalls are labelled directly; the act closes by pointing at
	 * the obvious suspect (the warming local sea) so the alibi scene can clear
	 * it. Real SPC record (static/data/scene_dry.json).
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyBars from '$lib/components/LazyBars.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.03, 0.2], text: 'Something keeps taking the rain.' },
		{ at: [0.2, 0.4], text: 'Most years, it lands near normal.' },
		{ at: [0.4, 0.62], text: 'But some years fall far short — and people remember those by name.' },
		{ at: [0.62, 0.82], text: '1997. 2015. 1993. 1982. 1992.', sub: 'The five driest years of the record: drought, highland frost, food shortage.' },
		{ at: [0.82, 1], text: 'The obvious suspect: the warming sea, one scene up.', sub: 'Warmer ocean, drier land — surely?' }
	];

	const fmt = (v) => (v > 0 ? '+' : '') + v.toFixed(1);
</script>

<ScrollScene
	id="2-dry"
	title="The dry years — Papua New Guinea rainfall anomaly, 1979–2025"
	heightVh={560}
	surface="dark"
	dataUrl="/data/scene_dry.json"
>
	{#snippet prose({ data })}
		<h2>Exhibit B: the dry years</h2>
		<p>
			The crime itself. The Pacific Community's rainfall-anomaly record for Papua New Guinea runs
			annually from 1979 to 2025 — each bar the departure of that year's rainfall from the
			long-term average. Most years sit near normal, but a handful fall far below it, and those
			are the years people remember: 1997 (−26.7&nbsp;mm), 2015 (−20.2&nbsp;mm), 1993
			(−18.7&nbsp;mm), 1982 (−17.7&nbsp;mm) and 1992 (−14.3&nbsp;mm) — years of drought, highland
			frost and food shortage. Scene one showed the obvious suspect: a local sea at record warmth.
			The next scene puts that suspect on trial.
		</p>
		{#if data}
			<DataTable
				caption="Rainfall anomaly (mm) by year"
				columns={['Year', 'Rainfall anomaly (mm)', '']}
				rows={data.years.map((d) => [d.year, fmt(d.value), d.driest ? 'driest' : ''])}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		<div class="wrap">
			<header>
				<p class="kicker">Papua New Guinea · annual rainfall anomaly (mm vs the long-term average)</p>
				<h2 class="display">The dry years.</h2>
			</header>
			{#if data}
				<LazyBars
					values={data.years}
					markYears={data.driest}
					{progress}
					mode="dark"
					unit="mm"
					height={360}
					ariaLabel="Bar chart of Papua New Guinea rainfall anomaly from 1979 to 2025. Most years are near normal; the five driest are 1997 at minus 26.7 millimetres, 2015 at minus 20.2, 1993 at minus 18.7, 1982 at minus 17.7 and 1992 at minus 14.3."
				/>
			{/if}
			<div class="steps-row">
				<SceneSteps {steps} {progress} width="32rem" />
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
	}
</style>
