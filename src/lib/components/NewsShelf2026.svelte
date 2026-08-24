<script>
	/**
	 * NewsShelf2026 — the live paper trail. Real, dated coverage of the 2026
	 * El Niño as it unfolds in Papua New Guinea: the official declaration,
	 * the national directives, the agency drought updates, and the first
	 * impacts on the record (highlands frost and food-security warnings, the
	 * Sirinumu drawdown and Port Moresby's power rationing). Same contract
	 * as the 1997/2015 shelf: external links, our summaries.
	 *
	 * Kept current by hand — last refreshed 6 Aug 2026, when the Highlands
	 * frost reports and the move of the official outlook to "very strong" were
	 * added. The "as of" line in the shelf note below comes from the pipeline
	 * (now.updated) — update OFFICIAL.as_of in prep/make_real_data.mjs and
	 * re-run it, and every freshness surface moves together.
	 */
	import { reveal } from '$lib/reveal.js';
	import { now } from '$lib/generated/now-copy.js';

	const ITEMS = [
		{
			source: 'PNG National Weather Service',
			date: 'May–June 2026',
			title: 'El Niño declared in the tropical Pacific',
			url: 'https://www.facebook.com/pngmet/posts/-official-media-release-el-ni%C3%B1o-declared-in-the-tropical-pacificthe-papua-new-gu/1298727142436444/',
			summary:
				'The official declaration: after a first advisory on 1 May 2026 and three consecutive months of oceanic and atmospheric monitoring, the national service called the event.',
			points: [
				'El Niño typically shifts rain toward the central Pacific — and away from Papua New Guinea.',
				'Below-normal rainfall expected nationwide while conditions persist.',
				'The declaration is the signal this piece is about: it arrived months ahead of the worst.'
			]
		},
		{
			source: 'PM James Marape · PM&NEC',
			date: '2026',
			title: 'Prime Minister directs nationwide preparedness as El Niño threatens prolonged dry season',
			url: 'https://www.pmnec.gov.pg/prime-minister-marape-directs-nationwide-preparedness-as-el-nino-threatens-prolonged-dry-season/',
			summary:
				'The national directive: every province and district told to prepare before conditions worsen, with outlooks pointing to El Niño persisting through the second half of 2026.',
			points: [
				'Identify vulnerable communities and map water sources before the dry deepens.',
				'Protect and repair community water systems; prepare food and agriculture contingencies.',
				'The named risks are this piece’s chapters: dry spells, low rivers, crop stress, bushfires, highland frost.'
			]
		},
		{
			source: 'PNG National Weather Service · via The National',
			date: 'July 2026',
			title: 'Drought warning for six Highlands provinces — and a drought that runs into 2027',
			url: 'https://www.thenational.com.pg/drought-to-go-on-until-2027/',
			summary:
				'The forecast horizon lengthens. The national service names the six Highlands provinces under warning and puts the end of the drought in the first quarter of 2027 — the same calendar chapter nine’s estimate arrives at from precedent alone.',
			points: [
				'Warning covers Jiwaka, Chimbu, Enga, Hela, Southern Highlands and Western Highlands; other provinces on the watch list.',
				'Below-average rainfall and rising moisture stress expected to persist across the Highlands and southern coast.',
				'Agriculture, health and water named as the sectors at risk — into the first quarter of 2027.'
			]
		},
		{
			source: 'NARI · Drought Update',
			date: 'February 2026',
			title: 'Drought early-warning status: Jiwaka on Alert, five provinces on Watch',
			url: 'https://www.nari.gov.pg/wp-content/uploads/2026/03/Drought-Update_February_2026.pdf',
			summary:
				'The official drought early-warning system, mid-escalation — the same DEWS tiers chapter four maps, filling in for 2026.',
			points: [
				'Jiwaka moved to Drought Alert; Chimbu, Enga, Hela, the NCD and Western Highlands on Drought Watch.',
				'Seasonal outlooks showed below-average rain over the Highlands and Western Province.',
				'Standing advice: plant the drought-resistant crops — sweet potato, cassava, taro, banana varieties.'
			]
		},
		{
			source: 'The National',
			date: '2026',
			title: 'El Niño signs hit Highlands: drought-induced conditions threaten food security',
			url: 'https://www.thenational.com.pg/el-nino-signs-hit-highlands-drought-induced-conditions-threaten-food-security/',
			summary:
				'The first impacts on the domestic record — and they follow the exposure map of 1997 and 2015 exactly.',
			points: [
				'Frost reported over food gardens at Gembogl (Chimbu), upper Mendi and Imbonggu (Southern Highlands) and parts of Hela.',
				'Falling water levels alongside the frost — the drought–frost pair of chapters four and five.',
				'Reporting puts roughly 1.9 million people at risk from the persistent highland dry spell.'
			]
		},
		{
			source: 'PNG Today / EMTV',
			date: 'June 2026',
			title: 'Port Moresby faces extended power rationing as Sirinumu Dam falls',
			url: 'https://news.pngfacts.com/2026/06/png-capital-port-moresby-faces-extended.html',
			summary:
				'The capital’s version of the drying river: the dam that waters and powers Port Moresby, drawn down under a rain that has not come.',
			points: [
				'Sirinumu Dam under controlled drawdown; output cut across the whole Rouna hydro cascade.',
				'Load shedding in the capital; diesel generation brought in to cover the hydro shortfall.',
				'Conservation measures flagged for up to ten months — the forecast length of the event.'
			]
		},
		{
			source: 'NOAA CPC / IRI · WMO',
			date: 'August 2026',
			title: 'The outlook moves from “strong” to “very strong”',
			url: 'https://iri.columbia.edu/our-expertise/climate/forecasts/enso/current/',
			summary:
				'The far-ocean signal chapter nine reads, updated. Between June and August the official expectation for this event crossed the threshold that 1982, 1997 and 2015 defined.',
			points: [
				'El Niño Advisory in force; continuation into early 2027 put at roughly 97 %.',
				'A very strong peak — Niño 3.4 at or above +2.0 °C — is now the central expectation for late 2026.',
				'The quoted weekly index reached about +2.1 °C in mid-July; WMO’s August update expects further intensification through October.'
			]
		}
	];
</script>

<section id="ch-shelf26" class="newsshelf" aria-label="Live coverage of the 2026 El Niño in Papua New Guinea">
	<header class="chapter-head">
		<p class="chapter-no" use:reveal>Interlude · 2026, on the record</p>
		<h2 use:reveal={{ delay: 90 }}>It is already happening, on schedule.</h2>
		<p class="standfirst" use:reveal={{ delay: 200 }}>
			The 1997 and 2015 documents above come from archives. These are being written now: the
			declaration, the directives, the frost reports and the first impacts of the 2026 event, as
			reported. Seven documents — and they follow the old pattern exactly.
		</p>
	</header>

	<div class="shelf">
		{#each ITEMS as item, i (item.url)}
			<article class="clip" use:reveal={{ delay: (i % 3) * 80 }}>
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
		External links; summaries are our own reading of each document as of
		<strong>{now.updated.label}</strong>. Compare with the 1997 and 2015 shelf above: the same
		provinces, the same altitudes, the same rivers. The difference this time — the warning came
		first.
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
