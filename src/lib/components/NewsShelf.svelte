<script>
	/**
	 * NewsShelf — the paper trail. Real, dated coverage of the 1997–98 and
	 * 2015–16 El Niño emergencies in Papua New Guinea: relief reporting,
	 * research and analysis, each with a short summary and its key points.
	 * The links are external and load nothing on this page; summaries are
	 * ours, written from the documents. This is the piece's evidence that
	 * "what to expect" is not a forecast — it is a memory.
	 */
	const ITEMS = [
		{
			source: 'ReliefWeb · UN OCHA',
			date: '1997–98',
			title: 'Papua New Guinea: Drought — the 1997 emergency record',
			url: 'https://reliefweb.int/disaster/dr-1997-000263-png',
			summary:
				'The UN’s running situation reports from the 1997–98 El Niño, as the emergency unfolded.',
			points: [
				'Most of the country had little or no rain from early 1997.',
				'Repeated frosts hit the high-altitude communities of Enga, Southern Highlands and Western Highlands.',
				'The upper Fly River communities were cut off when the drought stopped the barges — their supply line.'
			]
		},
		{
			source: 'IFRC · ReliefWeb',
			date: 'August 2015',
			title: 'Frost and drought strike Papua New Guinea',
			url: 'https://reliefweb.int/report/papua-new-guinea/frost-and-drought-strike-papua-new-guinea',
			summary:
				'The Red Cross bulletin from the week the 2015 event turned serious in the Highlands.',
			points: [
				'The worst frost in about forty years hit Enga Province, directly affecting some 300,000 people.',
				'The National Weather Service warned the developing El Niño could rival 1997–98.',
				'Sweet potato — the staple — was the first and hardest loss.'
			]
		},
		{
			source: 'The Conversation',
			date: 'August 2015',
			title: 'As Papua New Guinea faces worsening drought, a past disaster could save lives',
			url: 'https://theconversation.com/as-papua-new-guinea-faces-worsening-drought-a-past-disaster-could-save-lives-46390',
			summary:
				'Researchers argue, mid-crisis, exactly what this piece argues: 1997 already taught the lessons — use them.',
			points: [
				'The 1997–98 event was studied village by village; the response playbook existed.',
				'Knowing which communities are exposed (very high altitude, atolls, the dry fringes) lets aid move early.',
				'Preparation beats reaction: the disaster was predictable months ahead.'
			]
		},
		{
			source: 'Devpolicy Blog · ANU',
			date: 'January 2016',
			title: 'The ongoing impact of the El Niño drought and frosts in Papua New Guinea',
			url: 'https://devpolicy.org/the-ongoing-impact-of-the-el-nino-drought-and-frosts-in-papua-new-guinea-20160115/',
			summary:
				'Field-based assessment of the 2015–16 event at its peak, from the researchers who tracked it garden by garden.',
			points: [
				'Around 700,000 people were living in areas with severely reduced food production.',
				'Schools closed for lack of water; health worsened with the food shortfall.',
				'The Fly River was unshippable for months — the 1997 story, repeated.'
			]
		},
		{
			source: 'Inter-agency report · ReliefWeb',
			date: 'September 2016',
			title: 'El Niño 2015/2016 post-drought assessment, Papua New Guinea',
			url: 'https://reliefweb.int/report/papua-new-guinea/el-ni-o-20152016-post-drought-assessment-report-inter-agency-post-drought',
			summary: 'The formal accounting, once the event had passed.',
			points: [
				'About 480,000 people had faced critical food shortages at the peak.',
				'Water, health and schooling were hit alongside food.',
				'The worst-affected places matched the known exposure map: very high altitude, inland lowlands, dry islands.'
			]
		},
		{
			source: 'IOM · ReliefWeb',
			date: '2016',
			title: 'Floods and landslides follow drought in PNG highlands',
			url: 'https://reliefweb.int/report/papua-new-guinea/floods-and-landslides-follow-drought-png-highlands',
			summary: 'The aftermath, on the record: the same valleys, months later, under water.',
			points: [
				'When the El Niño broke, the Wahgi valley in Jiwaka flooded and slopes failed.',
				'Roughly five thousand households were hit by floods or landslides.',
				'The communities were the ones that had just endured the drought.'
			]
		}
	];
</script>

<section class="newsshelf" aria-label="Real coverage of Papua New Guinea's El Niño emergencies">
	<header class="chapter-head">
		<p class="chapter-no">Interlude · the paper trail</p>
		<h2>None of this is hypothetical.</h2>
		<p class="standfirst">
			Every mechanism in the chapters above is on the public record, twice over — reported as it
			happened in 1997–98 and again in 2015–16. Six documents, summarised; follow any of them to
			the source.
		</p>
	</header>

	<div class="shelf">
		{#each ITEMS as item (item.url)}
			<article class="clip">
				<p class="clip-meta">{item.source} · {item.date}</p>
				<h3><a href={item.url} rel="external noopener">{item.title}</a></h3>
				<p class="clip-summary">{item.summary}</p>
				<ul>
					{#each item.points as pt (pt)}
						<li>{pt}</li>
					{/each}
				</ul>
			</article>
		{/each}
	</div>

	<p class="shelf-note">
		External links; summaries are this piece's own reading of each document. The pattern to take
		away: the same provinces, the same altitudes, the same rivers — eighteen years apart.
	</p>
</section>

<style>
	.newsshelf {
		max-width: 72rem;
		margin: 0 auto;
		padding: clamp(3.5rem, 9vh, 6rem) 1.5rem;
	}

	.shelf {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		gap: 1.25rem;
	}

	.clip {
		background: var(--paper-raised);
		border: 1px solid var(--ink-light-grid);
		border-top: 3px solid var(--accent-light);
		border-radius: 12px;
		padding: 1.1rem 1.25rem;
	}

	.clip-meta {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-light-muted);
		margin-bottom: 0.5rem;
	}

	.clip h3 {
		font-size: 1.05rem;
		line-height: 1.25;
		margin-bottom: 0.45em;
	}

	.clip h3 a {
		text-decoration-thickness: 1px;
	}

	.clip-summary {
		font-size: 0.88rem;
		color: var(--ink-light-secondary);
		margin-bottom: 0.6em;
	}

	.clip ul {
		margin: 0;
		padding-left: 1.1rem;
		font-size: 0.84rem;
		line-height: 1.5;
		color: var(--ink-light-secondary);
	}

	.clip li {
		margin-bottom: 0.35em;
	}

	.shelf-note {
		max-width: 44rem;
		margin: 1.75rem auto 0;
		font-size: 0.85rem;
		color: var(--ink-light-muted);
		text-align: center;
	}
</style>
