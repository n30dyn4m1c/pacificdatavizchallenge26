<script>
	/**
	 * Scene 7 — The whole record. A small-multiples close: every Papua New
	 * Guinea indicator used in the piece, drawn as a compact spark line with
	 * its first→last change, so the reader sees the full official record at a
	 * glance. All real (static/data/scene7_record.json). Prints to one page.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import AnnualLines from '$lib/components/AnnualLines.svelte';

	const fmt = (v, unit) => {
		const s = Math.abs(v) >= 100 ? Math.round(v).toLocaleString('en') : Math.abs(v) < 1 ? v.toFixed(2) : v.toFixed(1);
		return (unit === '°C' && v > 0 ? '+' : '') + s;
	};
	const changeNote = (p) => {
		const d = p.last.value - p.first.value;
		const sign = d > 0 ? '▲' : d < 0 ? '▼' : '→';
		return `${sign} ${fmt(p.last.value, p.unit)} ${p.unit} in ${p.last.year} · from ${fmt(p.first.value, p.unit)} in ${p.first.year}`;
	};
</script>

<ScrollScene
	id="7-calendar"
	title="The whole record — Papua New Guinea climate indicators"
	pin={false}
	surface="light"
	printable={true}
	dataUrl="/data/scene7_record.json"
>
	{#snippet prose({ data })}
		<h2>The whole record</h2>
		<p>
			Every indicator in this piece, drawn small and together: Papua New Guinea's sea-surface and
			land-surface temperature anomalies, its rainfall anomaly, sea level, crop yield and
			greenhouse-gas emissions per person — each the official annual series from the Pacific
			Community, on the Pacific Data Hub. The warming lines climb, the rainfall spikes down in the
			El Niño years, the sea rises, and the emissions that drive it all stay near the floor.
		</p>
	{/snippet}

	{#snippet children({ data })}
		<div class="record">
			<header class="record-head">
				<p class="kicker">Papua New Guinea · the official climate record, at a glance</p>
				<h2 class="display">The whole record.</h2>
			</header>

			{#if data}
				<div class="grid">
					{#each data.panels as p (p.code)}
						<figure class="panel">
							<figcaption>
								<span class="panel-name">{p.name}</span>
								<span class="panel-change">{changeNote(p)}</span>
							</figcaption>
							<AnnualLines
								series={[{ key: p.code, name: p.name, accent: p.kind === 'anomaly', values: p.years }]}
								mode="light"
								unit={p.unit}
								compact={true}
								height={150}
								baseline={p.kind === 'anomaly' ? 0 : null}
								ariaLabel="{p.name}: {changeNote(p)}"
							/>
						</figure>
					{/each}
				</div>

				<p class="closing">
					The ocean warmed first, and it is still warming. The record is public, annual, and
					unambiguous — and the years it names as the driest are the years people here already
					remember by name.
				</p>
				<p class="source-line">
					Source: {data.source.name} ({data.source.dataflow}), {data.source.hub}.
					Official dataset of the Pacific Data Viz Challenge 2026.
				</p>
			{/if}
		</div>
	{/snippet}
</ScrollScene>

<style>
	.record {
		max-width: 72rem;
		margin: 0 auto;
		padding: 4rem 1.25rem 5rem;
	}

	.record-head {
		margin-bottom: 2rem;
	}

	h2.display {
		font-size: clamp(1.8rem, 5vw, 3rem);
		margin: 0.2em 0 0;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: 1.75rem 2rem;
	}

	.panel {
		margin: 0;
	}

	figcaption {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.35rem;
	}

	.panel-name {
		font-weight: 700;
		font-size: 0.95rem;
	}

	.panel-change {
		font-size: 0.72rem;
		color: var(--ink-light-secondary);
		font-variant-numeric: tabular-nums;
	}

	.closing {
		max-width: 42rem;
		margin: 2.75rem auto 0;
		font-family: Fraunces, Georgia, serif;
		font-size: clamp(1.1rem, 2.4vw, 1.5rem);
		line-height: 1.4;
		text-wrap: balance;
		text-align: center;
	}

	.source-line {
		max-width: 42rem;
		margin: 1.25rem auto 0;
		font-size: 0.75rem;
		color: var(--ink-light-muted);
		text-align: center;
	}
</style>
