<script>
	/**
	 * ChapterHead — the editorial header that opens each scrolly chapter:
	 * chapter number, a big balanced headline, and a short standfirst.
	 * `title` and `standfirst` accept markup (static strings authored in
	 * +page/scenes only — the highlight spans).
	 */
	let { no, title, standfirst = '' } = $props();
</script>

<header class="chapter-head">
	<p class="chapter-no">{no}</p>
	<h2>{@html title}</h2>
	{#if standfirst}
		<p class="standfirst">{@html standfirst}</p>
	{/if}
</header>
