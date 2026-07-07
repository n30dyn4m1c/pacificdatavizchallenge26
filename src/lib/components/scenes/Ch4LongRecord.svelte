<script>
	/**
	 * Chapter 4 — the long record. The 176-year sea-surface series draws
	 * itself under a giant year counter, reaches the 2025 record, then the
	 * graphic crossfades to the sea-level record (1993–2023). The last card
	 * carries the local "alibi": warm local years are WETTER (r = +0.48,
	 * computed in /prep), so the drought signal really is remote — which is
	 * exactly what makes it readable in advance.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import ChapterHead from '$lib/components/ChapterHead.svelte';
	import LazyLines from '$lib/components/LazyLines.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { cardIndex, clamp01 } from '$lib/scrolly.js';

	const N = 5;
	const fmt2 = (v) => (v > 0 ? '+' : '') + v.toFixed(2);
</script>

<ChapterHead
	no="Chapter four · the long record"
	title="The see&#8209;saw is bolted to a rising floor."
	standfirst="El Niño comes and goes — it always has. What’s new sits underneath it: the ocean around Papua New Guinea itself, measured one number a year since 1850."
/>

<ScrollScene
	id="4-longrecord"
	title="Papua New Guinea's sea-surface temperature anomaly 1850–2025, and sea level 1993–2023"
	heightVh={(N + 1) * 100}
	dataUrl="/data/scene_exposure.json"
>
	{#snippet prose({ data })}
		<h3>The long record, in prose</h3>
		<p>
			The Pacific Community's record of Papua New Guinea's sea-surface-temperature anomaly runs
			annually from 1850 to 2025. For a century it wobbles near zero; from the late 20th century
			it climbs; 2025 — at +1.1&nbsp;°C — is the warmest reading in all 176 years. The sea-level
			record is shorter (satellite era, 1993–2023) and rises about 0.3&nbsp;m across it. And one
			pointed footnote: the local sea is <em>not</em> what dries the gardens — warm local years
			are actually slightly wetter (correlation +0.48), because Papua New Guinea's rain lives on
			its warm water. The drought signal is genuinely remote, which is what makes it readable
			months ahead.
		</p>
		{#if data}
			<DataTable
				caption="Sea-surface anomaly and sea level, selected years"
				columns={['Year', 'Sea-surface anomaly (°C)', 'Sea-level anomaly (m)']}
				rows={[1850, 1900, 1950, 1993, 2000, 2010, 2020, 2025].map((yr) => {
					const t = data.sst.years.find((d) => d.year === yr);
					const s = data.sea_level.years.find((d) => d.year === yr);
					return [yr, t ? fmt2(t.value) : '—', s ? fmt2(s.value) : '—'];
				})}
			/>
		{/if}
	{/snippet}

	{#snippet children({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		{@const lineFrac = clamp01((progress * N) / 2.4)}
		{@const seaMode = idx >= 3}
		<div class="graphic">
			{#if data}
				{@const counterYear = 1850 + Math.round(lineFrac * (data.sst.years.length - 1))}
				<div class="stack">
					<div class="layer" style:opacity={seaMode ? 0 : 1}>
						<p class="graphic-title">
							SEA-SURFACE TEMPERATURE · departure from the long-term average, 1850–2025
						</p>
						<LazyLines
							series={[{ key: 'sst', name: 'Sea surface', accent: true, values: data.sst.years }]}
							markYears={idx === 2 ? [data.sst.record_year] : []}
							progress={lineFrac}
							mode="light"
							unit="°C"
							baseline={0}
							height={430}
							ariaLabel="Line chart of Papua New Guinea's sea-surface-temperature anomaly from 1850 to 2025: near zero for a century, climbing from the late 20th century to a record of plus 1.1 degrees in 2025."
						/>
					</div>
					<div class="layer" style:opacity={seaMode ? 1 : 0} inert={!seaMode}>
						<p class="graphic-title">SEA LEVEL · anomaly in metres (reported to 0.1 m), satellite era 1993–2023</p>
						<LazyLines
							series={[{ key: 'sea', name: 'Sea level', accent: true, values: data.sea_level.years }]}
							progress={seaMode ? 1 : 0}
							mode="light"
							unit="m"
							baseline={0}
							curve="step"
							height={430}
							ariaLabel="Line chart of the sea-level anomaly around Papua New Guinea from 1993 to 2023, rising from about minus 0.10 metres to plus 0.20 metres."
						/>
					</div>
					<!-- the giant year counter rides the draw-in, then bows out -->
					<div class="counter display" style:opacity={idx <= 2 && lineFrac < 1 ? 0.9 : 0} aria-hidden="true">
						{counterYear}
					</div>
				</div>
			{/if}
		</div>
	{/snippet}

	{#snippet flow({ progress, data })}
		{@const idx = cardIndex(progress, N)}
		<div class="card-slot first" class:active={idx === 0}>
			<div class="step-card">
				<span class="card-kicker">Zoom all the way out</span>
				<p>
					This is the sea around Papua New Guinea itself — one temperature reading a year,
					starting in <strong>1850</strong>. Watch the counter.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 1}>
			<div class="step-card">
				<span class="card-kicker">A century of wobble</span>
				<p>For a hundred years: wobble. Warm years, cool years, no trend worth naming.</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 2}>
			<div class="step-card">
				<span class="card-kicker">Then the climb</span>
				<p>
					Then the climb. <span class="hl hl-warm">2025: +1.1&nbsp;°C</span> — the warmest sea in
					the whole 176-year record.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 3}>
			<div class="step-card">
				<span class="card-kicker">Not just warmer</span>
				<p>
					Not just warmer — <strong>higher</strong>. The satellite record only begins in 1993,
					and it has already climbed about <strong>0.3&nbsp;m</strong> around the country.
				</p>
			</div>
		</div>
		<div class="card-slot" class:active={idx === 4}>
			<div class="step-card">
				<span class="card-kicker">One thing it isn’t</span>
				<p>
					One thing the local sea is <em>not</em>: the drought-maker. Warm local years are
					actually <span class="hl hl-cool">wetter</span> (correlation
					<strong>+{data ? data.r_local.toFixed(2) : '0.48'}</strong>) — the rain lives on the
					warm water. The dry signal truly comes from the far ocean… which is exactly why it can
					be read in advance.
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

	.counter {
		position: absolute;
		top: -0.35em;
		right: clamp(0.5rem, 4vw, 3rem);
		font-size: clamp(2.6rem, 9vw, 6rem);
		color: var(--ink-light-grid);
		font-variant-numeric: tabular-nums;
		pointer-events: none;
		transition: opacity 0.4s;
	}

	@media (prefers-reduced-motion: reduce) {
		.layer {
			transition: none;
		}
	}
</style>
