<script>
	/**
	 * Figure — the one chrome every sticky graphic wears, and the reason the
	 * charts finally fill their frame.
	 *
	 * Two jobs:
	 *
	 * 1. **Typographic hierarchy.** Chart chrome used to be a single all-caps
	 *    run-on line that wrapped to two lines and read as an error. A figure
	 *    now has a *title* (the finding, in the piece's voice — it may change
	 *    card to card), a *subtitle* (what is plotted, in what units, over
	 *    what span) and a *source* line pinned to the bottom of the frame.
	 *
	 * 2. **Height.** The body measures itself and hands its pixel height to
	 *    the chart, which sizes its viewBox to match. Charts previously took a
	 *    hard-coded `height={430}` and floated in the middle of a 900px pin
	 *    with a third of the screen empty above and below; now the graphic is
	 *    as tall as the space it was given, on every viewport.
	 *
	 * `body` is a snippet called with { h, w } — the measured content box.
	 */
	let {
		/** the finding, in sentence case — may change as cards advance */
		title,
		/** what is plotted, in what units, over what span */
		subtitle = '',
		/** provenance, set small at the foot of the frame */
		source = '',
		/** a caveat that belongs *on* the graphic (resolution, illustration, estimate) */
		note = '',
		/** drop the reading-width cap — for very wide graphics (the Pacific map) */
		wide = false,
		/**
		 * Aspect ratio (w ÷ h) for graphics whose geometry is fixed — maps and
		 * the elevation profile. Such a graphic cannot use extra height; given
		 * a tall frame it just letterboxes itself inside it. Declaring the
		 * ratio caps the body at the height the graphic can actually use and
		 * centres the whole figure instead, so the frame reads as composed
		 * rather than half-empty.
		 *
		 * A function `(width) => ratio` for geometry that changes shape with
		 * the viewport (the Pacific map crops on phones).
		 */
		fit = null,
		/** cap the body height in px — for charts that stop reading well when
		 *  stretched (the mirror's two bands must stay within one eye-drop) */
		maxHeight = null,
		body
	} = $props();

	// Seeded so the first paint is close to the settled size (the measured
	// value lands on the next frame and the chart re-renders once).
	let h = $state(420);
	let w = $state(720);

	const ratio = $derived(typeof fit === 'function' ? fit(w) : fit);
	const cap = $derived(Math.min(ratio ? w / ratio : Infinity, maxHeight ?? Infinity));
</script>

<figure class="graphic" class:wide class:capped={cap !== Infinity}>
	<div class="fig-head">
		<h3 class="fig-title">{@html title}</h3>
		{#if subtitle}
			<p class="fig-sub">{@html subtitle}</p>
		{/if}
	</div>

	<div
		class="fig-body"
		style:max-height={cap === Infinity ? null : `${Math.round(cap)}px`}
		bind:clientHeight={h}
		bind:clientWidth={w}
	>
		{@render body({ h, w })}
	</div>

	{#if note || source}
		<figcaption class="fig-foot">
			{#if note}<span class="fig-note">{@html note}</span>{/if}
			{#if source}<span class="fig-source">{@html source}</span>{/if}
		</figcaption>
	{/if}
</figure>
