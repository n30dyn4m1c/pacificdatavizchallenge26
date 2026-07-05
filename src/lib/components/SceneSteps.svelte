<script>
	/**
	 * SceneSteps — the pacing primitive for every pinned scene.
	 *
	 * One idea per step: each step is one sentence (max two short ones via
	 * `sub`). Steps share a single slot; the active one carries full visual
	 * weight, the previous one recedes above it at reduced opacity and
	 * slight scale-down, the next waits below at opacity 0. Windows come
	 * from `at: [start, end]` in scene progress, or are distributed evenly
	 * across [from, to] when omitted.
	 *
	 * The steps are the scroll-only narrative for sighted readers; screen
	 * readers get each scene's complete prose equivalent instead, so this
	 * layer is aria-hidden (opacity-churning text is noise in the a11y tree).
	 */
	let {
		steps = [],
		progress = 0,
		from = 0.03,
		to = 0.97,
		width = '30rem',
		class: klass = ''
	} = $props();

	const windows = $derived(
		steps.map((s, i) => {
			if (s.at) return s.at;
			const span = (to - from) / steps.length;
			return [from + i * span, from + (i + 1) * span];
		})
	);

	const activeIndex = $derived.by(() => {
		let a = -1;
		for (let i = 0; i < windows.length; i++) {
			if (progress >= windows[i][0]) a = i;
		}
		return a;
	});

	const stateOf = (i) =>
		i < activeIndex ? 'after' : i === activeIndex ? 'active' : 'before';
</script>

<div class="steps {klass}" style:max-width={width} aria-hidden="true">
	{#each steps as s, i (i)}
		{#if Math.abs(i - activeIndex) <= 1}
			<div class="step slot" data-state={stateOf(i)}>
				<p class="step-text">{s.text}</p>
				{#if s.sub}
					<p class="step-sub">{s.sub}</p>
				{/if}
			</div>
		{/if}
	{/each}
</div>

<style>
	.steps {
		display: grid;
		pointer-events: none;
	}

	.slot {
		grid-area: 1 / 1;
	}

	/* the receded step clears its own footprint upward, so it never sits
	   under the active step's text */
	.slot[data-state='after'] {
		transform: translateY(-115%) scale(0.97);
	}

	.step-text {
		font-family: Fraunces, Georgia, serif;
		font-size: clamp(1.15rem, 2.6vw, 1.65rem);
		font-weight: 700;
		line-height: 1.3;
		margin: 0 0 0.3em;
		text-wrap: balance;
	}

	.step-sub {
		font-size: 0.95rem;
		line-height: 1.5;
		margin: 0;
		opacity: 0.85;
	}

	@media (prefers-reduced-motion: reduce) {
		.slot[data-state='after'] {
			visibility: hidden; /* no transform allowed; hide instead of overlap */
		}
	}
</style>
