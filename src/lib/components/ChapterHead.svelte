<script>
	/**
	 * ChapterHead — the editorial header that opens each scrolly chapter:
	 * chapter number, a big balanced headline, and a short standfirst,
	 * settling into place in sequence (src/lib/reveal.js — inert under
	 * prefers-reduced-motion and in prerendered HTML). `title` and
	 * `standfirst` accept markup (static strings authored in +page/scenes
	 * only — the highlight spans).
	 */
	import { reveal } from '$lib/reveal.js';

	let { no, title, standfirst = '' } = $props();
</script>

<header class="chapter-head">
	<p class="chapter-no" use:reveal>{no}</p>
	<h2 use:reveal={{ delay: 90 }}>{@html title}</h2>
	{#if standfirst}
		<p class="standfirst" use:reveal={{ delay: 200 }}>{@html standfirst}</p>
	{/if}
</header>
