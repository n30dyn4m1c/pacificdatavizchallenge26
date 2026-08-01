<script>
	/** LazyProfile — code-split wrapper around IslandProfile (chapter four, layer 2). */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);

	onMount(() => {
		import('./IslandProfile.svelte').then((m) => (Chart = m.default));
	});
</script>

{#if Chart}
	<Chart {...props} />
{:else}
	<div class="chart-skeleton" style:height="100%" aria-hidden="true"></div>
{/if}
