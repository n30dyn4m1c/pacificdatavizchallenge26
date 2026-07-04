<script>
	/**
	 * Scene 7 — The Calendar. The payoff: an interactive anticipatory-action
	 * calendar. Province selector → month-by-month action grid with triggers
	 * and lead agencies. This scene alone is printable (see app.css @media
	 * print) — the piece ends as a usable tool.
	 */
	import ScrollScene from '$lib/components/ScrollScene.svelte';

	let selected = $state(0);
</script>

<ScrollScene
	id="7-calendar"
	title="Anticipatory-action calendar by province"
	surface="light"
	pin={false}
	printable={true}
	dataUrl="/data/scene7_calendar.json"
>
	{#snippet prose()}
		<h2>The calendar</h2>
		<p>
			Everything above exists for this page. Because the ocean signals months ahead, each
			province can hold a calendar of actions with explicit triggers: not “respond to the
			disaster” but “when the index crosses this line, do this, and this agency leads.” Choose a
			province, read its months, print it, and put it on the wall of the provincial disaster
			office. (Placeholder actions — to be co-drafted with the National Disaster Centre and
			provincial Divisions of Agriculture and Livestock.)
		</p>
	{/snippet}

	{#snippet children({ data })}
		<div class="calendar">
			<header class="cal-head">
				<p class="kicker">The payoff · a tool, not a chart</p>
				<h2 class="display">The calendar was printed<br />before the disaster.</h2>
				<p class="cal-intro no-print">
					The months between signal and consequence are working months. Pick a province — each
					action is tied to a trigger you can verify and an agency that leads.
				</p>
			</header>

			{#if data}
				<div class="selector no-print" role="tablist" aria-label="Choose a province">
					{#each data.provinces as p, i (p.name)}
						<button
							role="tab"
							aria-selected={selected === i}
							class:on={selected === i}
							onclick={() => (selected = i)}
						>
							{p.name}
						</button>
					{/each}
				</div>

				{#each [data.provinces[selected]] as prov (prov.name)}
					<section class="grid-wrap" aria-label="Actions for {prov.name}">
						<h3 class="prov-title display">{prov.name} <span>· anticipatory-action calendar · strong El Niño 2026–27</span></h3>
						<div class="action-grid">
							{#each prov.actions as a (a.month + a.action)}
								<article class="action">
									<div class="month display">{a.month}</div>
									<div class="body">
										<p class="what">{a.action}</p>
										<p class="trigger"><span class="t-label">trigger</span> {a.trigger}</p>
										<p class="agency">{a.lead_agency}</p>
									</div>
								</article>
							{/each}
						</div>
					</section>
				{/each}

				<div class="print-row no-print">
					<button class="print-btn" onclick={() => window.print()}>
						Print this province’s calendar
					</button>
					<span class="print-note">prints to a single clean page</span>
				</div>
			{/if}

			<footer class="cal-foot">
				<p>
					Placeholder data · Pacific Data Viz Challenge 2026 entry · sources and the real data
					pipeline are documented in the repository’s <code>/prep</code> directory.
				</p>
			</footer>
		</div>
	{/snippet}
</ScrollScene>

<style>
	.calendar {
		max-width: 62rem;
		margin: 0 auto;
		padding: 5rem 1.25rem 4rem;
	}

	.cal-head h2 {
		font-size: clamp(1.9rem, 5.5vw, 3.2rem);
	}

	.cal-intro {
		color: var(--ink-light-secondary);
	}

	.selector {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 1.5rem 0;
	}

	.selector button {
		font: 600 0.8rem/1 'Public Sans', system-ui, sans-serif;
		padding: 0.55rem 0.95rem;
		border-radius: 999px;
		border: 1px solid var(--ink-light-axis);
		background: transparent;
		color: var(--ink-light-secondary);
		cursor: pointer;
	}

	.selector button.on {
		background: var(--ink-light-primary);
		border-color: var(--ink-light-primary);
		color: var(--paper);
	}

	.prov-title {
		font-size: 1.4rem;
		margin: 1.5rem 0 1rem;
	}

	.prov-title span {
		font-family: 'Public Sans', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 400;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
	}

	.action-grid {
		display: grid;
		gap: 0.75rem;
	}

	.action {
		display: grid;
		grid-template-columns: 5.5rem 1fr;
		gap: 1rem;
		padding: 0.9rem 1rem;
		background: var(--paper-raised);
		border: 1px solid var(--ink-light-grid);
		border-radius: 8px;
	}

	.month {
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--accent-light);
	}

	.what {
		font-weight: 600;
		margin-bottom: 0.35em;
	}

	.trigger {
		font-size: 0.85rem;
		color: var(--ink-light-secondary);
		margin-bottom: 0.25em;
	}

	.t-label {
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		border: 1px solid var(--ink-light-axis);
		border-radius: 4px;
		padding: 0.1rem 0.35rem;
		margin-right: 0.4rem;
	}

	.agency {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
		margin: 0;
	}

	.print-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 2rem 0;
	}

	.print-btn {
		font: 600 0.85rem/1 'Public Sans', system-ui, sans-serif;
		padding: 0.75rem 1.25rem;
		border-radius: 6px;
		border: none;
		background: var(--accent-light);
		color: var(--paper-raised);
		cursor: pointer;
	}

	.print-note {
		font-size: 0.75rem;
		color: var(--ink-light-muted);
	}

	.cal-foot {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--ink-light-grid);
		font-size: 0.75rem;
		color: var(--ink-light-muted);
	}

	@media print {
		.calendar {
			padding: 0;
		}

		.action {
			border: 1px solid #999;
			break-inside: avoid;
			padding: 0.5rem 0.75rem;
		}

		.action-grid {
			gap: 0.4rem;
		}

		.month {
			color: #000;
		}

		.cal-head h2 {
			font-size: 1.6rem;
		}
	}
</style>
