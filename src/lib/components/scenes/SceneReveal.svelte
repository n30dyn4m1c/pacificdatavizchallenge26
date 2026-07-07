<script>
	/**
	 * Act IV — The far ocean. The reveal: the Oceanic Niño Index (NOAA CPC —
	 * the one series in the piece not from the SPC dataflow, committed and
	 * documented in /prep) mirrored above Papua New Guinea's rainfall anomaly.
	 * El Niño spikes up; the rain at home collapses beneath them. Eight of the
	 * ten driest years are El Niño years; the other two trail the 1991–92
	 * event. r(ONI, rain) = −0.64, computed in /prep.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';
	import SceneSteps from '$lib/components/SceneSteps.svelte';
	import LazyMirror from '$lib/components/LazyMirror.svelte';
	import TapReveal from '$lib/components/beats/TapReveal.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	const steps = [
		{ at: [0.03, 0.16], text: 'The clue is where the warm water goes.' },
		{ at: [0.16, 0.32], text: 'Some years, the Pacific’s warmth drains east along the equator: El Niño.', sub: 'Measured in the Niño 3.4 region, thousands of kilometres east of Papua New Guinea. Up = El Niño, down = La Niña.' },
		{ at: [0.32, 0.5], text: 'Line that far ocean up against the rain at home.' },
		{ at: [0.5, 0.66], text: 'When the far ocean spikes, the rain at home collapses.', sub: '1982. 1997. 2015. The great El Niños are the great droughts.' },
		{ at: [0.66, 0.82], text: 'Eight of the ten driest years were El Niño years.', sub: 'The other two — 1992 and 1993 — trailed the long 1991–92 event.' },
		{ at: [0.82, 1], text: 'The rain leaves with the warm water.', sub: 'El Niño years average −5.9 mm of rainfall anomaly; all other years +3.5 mm. Correlation −0.64.' }
	];

	const phaseName = { elnino: 'El Niño', lanina: 'La Niña', neutral: 'neutral', pending: '—' };
	const fmt = (v, p = 1) => (v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(p));
</script>

<ScrollScene
	id="4-reveal"
	title="The far ocean — the Oceanic Niño Index against Papua New Guinea's rainfall, 1979–2025"
	heightVh={680}
	surface="dark"
	dataUrl="/data/scene_reveal.json"
>
	{#snippet prose({ data })}
		<h2>Exhibit D: the far ocean</h2>
		<p>
			The reveal. The upper band is the Oceanic Niño Index — NOAA's measure of the sea-surface
			anomaly in the Niño&nbsp;3.4 region of the central equatorial Pacific, thousands of
			kilometres east of Papua New Guinea. When it spikes upward the Pacific is in El Niño: the
			warm pool, and the rising rain-making air above it, has drained east away from Papua New
			Guinea. The lower band is the same rainfall record as before. They mirror each other. Eight
			of the ten driest years in the record are El Niño years — 1997, 2015, 1982, 1979, 1994,
			1987, 2004 and 1991 — and the remaining two, 1992 and 1993, sit in the trailing warmth of
			the long 1991–92 event. Across the record, El Niño years average −5.9&nbsp;mm of rainfall
			anomaly against +3.5&nbsp;mm in all other years; the correlation is −0.64. The thief is an
			ocean Papua New Guinea cannot see from its own shore. (The ONI is the one series here not
			from the SPC dataflow; it is NOAA CPC data, documented in /prep.)
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
		<div class="wrap">
			<header>
				<p class="kicker">The Oceanic Niño Index (NOAA CPC) over Papua New Guinea’s rainfall (SPC)</p>
				<h2 class="display">The far ocean.</h2>
			</header>
			{#if data}
				<LazyMirror
					years={data.years}
					markYears={progress > 0.5 ? [1982, 1997, 2015] : []}
					{progress}
					mode="dark"
					height={440}
					ariaLabel="Two mirrored bar charts sharing one time axis from 1979 to 2025. Above: the Oceanic Niño Index, spiking upward in El Niño years like 1982, 1997, 2015 and 2023. Below: Papua New Guinea's rainfall anomaly, collapsing downward beneath almost every El Niño spike. Eight of the ten driest years are El Niño years."
				/>
			{/if}
			<div class="steps-row">
				<SceneSteps {steps} {progress} width="34rem" />
				<div class="reveal-slot" class:hidden={progress <= 0.32} inert={progress <= 0.32}>
					<TapReveal id="reveal-enso" label="What exactly is El Niño? →">
						<h3>A see-saw the size of an ocean</h3>
						<p>
							In an ordinary year, trade winds pile the Pacific's warmest water into the west —
							around Papua New Guinea — and the air rising off that warm pool makes the region's
							rain. Every few years the winds slacken and the warm water slides back east along
							the equator. That is El Niño; La Niña is the same see-saw tipped the other way.
						</p>
						<p>
							Scientists index it with the sea-surface anomaly in one patch of the central
							Pacific — the Niño&nbsp;3.4 region. It is the ocean-scale signal this national
							dataset cannot carry: Papua New Guinea's own sea reads near normal in 1997 while
							the far ocean, and the country's rain, went to extremes.
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
		max-width: 66rem;
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
