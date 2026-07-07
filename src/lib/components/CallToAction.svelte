<script>
	/**
	 * CallToAction — the close of the argument. The whole piece has shown
	 * that El Niño's damage in Papua New Guinea follows a known sequence,
	 * announced months ahead by an ocean thermometer. This section turns
	 * that into the ask: treat the predictable as predictable — read the
	 * signal, plan on the known exposure map, move money early, teach the
	 * pattern. Plain, practical register; no slogans.
	 */
	const ASKS = [
		{
			no: '01',
			title: 'Read the signal',
			body: 'The Niño 3.4 thermometer is public and months ahead of the rain. Keep the national weather service and the drought early-warning system funded, staffed and heard — a warning that reaches a district office in June is worth more than a relief flight in December.'
		},
		{
			no: '02',
			title: 'Plan on the known map',
			body: 'The exposure map has not moved: very high altitude gardens, atolls and dry islands, and the river-supplied lowlands. Each has a known failure — frost, tanks, barges — so each can have a plan written before the year it is needed, not during it.'
		},
		{
			no: '03',
			title: 'Move money early',
			body: 'Water storage, kaukau cutting banks, cassava and other frost-hardy plantings, school tanks, pre-positioned supplies for the river towns: all of it is cheap in the months the ONI is climbing and expensive after the gardens die. Budget on the ocean’s calendar, not the emergency’s.'
		},
		{
			no: '04',
			title: 'Teach the pattern',
			body: 'Drought, then frost, then the flood when it breaks: the sequence is old enough that grandparents remember it and documented enough that schools can teach it. A community that knows what comes next — and in what order — loses gardens, not lives.'
		}
	];
</script>

<section class="cta" aria-label="What the record asks of us">
	<header class="chapter-head">
		<p class="chapter-no">The ask</p>
		<h2>Prepare for the predictable.</h2>
		<p class="standfirst">
			No one in Papua New Guinea can stop an El Niño, and no policy written in Port Moresby will
			cool the far ocean. But nothing in this story arrived unannounced: the signal came months
			early, the damage followed a sequence the record has already written down twice — and the
			third writing has begun, with most of its hard months still ahead. That is what preparation
			is for.
		</p>
	</header>

	<div class="asks">
		{#each ASKS as ask (ask.no)}
			<article class="ask">
				<p class="ask-no display">{ask.no}</p>
				<h3>{ask.title}</h3>
				<p>{ask.body}</p>
			</article>
		{/each}
	</div>

	<p class="cta-close">
		The see-saw has tipped again — that much is already measured. The choice the record leaves is
		whether this El Niño, in its hardest months, meets a country that has read its own history, or
		one that has to live it again from the beginning.
	</p>
</section>

<style>
	.cta {
		max-width: 72rem;
		margin: 0 auto;
		padding: clamp(3.5rem, 10vh, 7rem) 1.5rem;
	}

	.asks {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: 1.25rem;
	}

	.ask {
		background: var(--paper-raised);
		border: 1px solid var(--ink-light-grid);
		border-radius: 12px;
		padding: 1.25rem 1.35rem;
	}

	.ask-no {
		font-size: 2rem;
		color: var(--accent-light);
		margin: 0 0 0.15em;
	}

	.ask h3 {
		font-size: 1.15rem;
		margin-bottom: 0.4em;
	}

	.ask p:last-child {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--ink-light-secondary);
	}

	.cta-close {
		max-width: 42rem;
		margin: 2.75rem auto 0;
		font-family: Fraunces, Georgia, serif;
		font-weight: 700;
		font-size: clamp(1.1rem, 2.4vw, 1.5rem);
		line-height: 1.45;
		text-align: center;
		text-wrap: balance;
	}
</style>
