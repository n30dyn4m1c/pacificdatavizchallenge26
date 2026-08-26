<script>
	/** LazyProfile — code-split wrapper around IslandProfile (chapter four, layer 2). */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);
	let failed = $state(false);

	onMount(() => {
		import('./IslandProfile.svelte')
			.then((m) => (Chart = m.default))
			.catch(() => (failed = true));
	});
</script>

{#if Chart}
	<Chart {...props} />
{:else if failed}
	<p class="chart-failed">This chart could not be loaded — the prose and the data table tell the same story.</p>
{:else}
	<div class="chart-skeleton" style:height="100%" aria-hidden="true"></div>
{/if}
