<script>
	/**
	 * Chapter 3 — the rain follows. The mirror chart: Papua New Guinea's
	 * rainfall anomaly alone first, then the far ocean fades in above it, then
	 * the connectors on 1982/1997/2015 walk the eye from spike to shortfall.
	 * All statistics quoted are computed by /prep and shipped in the JSON.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyMirror from '$lib/components/LazyMirror.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, sweep } from '$lib/scrolly.js';

	const N = 4;
	const phaseName = { elnino: 'El Niño', lanina: 'La Niña', neutral: 'neutral', pending: '—' };
	const fmt = (v) => (v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1));
</script>

<ChapterHead
	no="Chapter three · the rain"
	title="When the far ocean tips, the rain follows."
	standfirst="Papua New Guinea keeps its own record: how much rain each year brought, above or below normal. Put it under the see&#8209;saw and the pattern is hard to miss."
/>

<ScrollScene
	id="2-signal"
	title="The Oceanic Niño Index over Papua New Guinea's rainfall anomaly, 1979–2025"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_reveal.json"
>
	{#snippet prose({ data })}
		<h3>The rain, in prose</h3>
		<p>
			The Pacific Community's rainfall-anomaly record for Papua New Guinea (annual, 1979–2025)
			mirrors the far ocean: when the Oceanic Niño Index spikes upward — El Niño — the rain at
			home collapses. Eight of the ten driest years in the record are El Niño years; the other
			two, 1992 and 1993, sit in the trailing warmth of the long 1991–92 event. Averaged across
			the record, El Niño years run −5.9&nbsp;mm against +3.5&nbsp;mm in all other years, a
			correlation of −0.64. The great El Niños of chapter two — 1982, 1997, 2015 — are the
			great droughts of this chart.
		</p>
		{#if data}
			<DataTable
				caption="The ten driest years and the state of the far ocean"
				columns={['Year', 'ENSO phase', 'Rainfall anomaly (mm)']}
				rows={data.driest10.map((d) => {
					const yr = data.years.find((y) => y.year === d.year);
					return [d.year, phaseName[d.phase] ?? d.phase, fmt(yr?.rain)];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<div class="graphic">
			{#if data}
				<LazyMirror
					years={data.years}
					showOni={idx >= 1}
					markYears={idx >= 2 ? [1982, 1997, 2015] : []}
					progress={sweep(progress, N)}
					mode="light"
					height={470}
					ariaLabel="Two mirrored bar charts sharing one time axis from 1979 to 2025: the Oceanic Niño Index above, Papua New Guinea's rainfall anomaly below. Beneath almost every El Niño spike — 1982, 1997, 2015 — the rainfall collapses."
				/>
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">The home record</span>
				<p>
					This is Papua New Guinea’s own rain: one bar per year, above or below its long-term
					normal. The <span class="hl hl-warm">dry years</span> point down, the
					<span class="hl hl-cool">wet years</span> up.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">Now, together</span>
				<p>
					Bring back the far ocean, same years, right on top. Read any El Niño spike above, then
					drop your eye straight down.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">The pattern</span>
				<p>
					<strong>1982. 1997. 2015.</strong> Every great spike above meets a collapse below.
					<span class="hl hl-warm">Eight of the ten driest years</span> were El Niño years — and
					the other two came in the long tail of one.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">Two ways to say it</span>
				<p>
					A statistician says: correlation <strong>−0.64</strong>. El Niño years average
					<strong>{data ? data.mean_rain_elnino : '−5.9'}&nbsp;mm</strong>; every other year,
					<strong>+{data ? data.mean_rain_other : '3.5'}&nbsp;mm</strong>.
				</p>
				<p>A gardener says: when the far ocean warms, carry water.</p>
			</div>
		</div>
	{/snippet}
</ScrollScene>
