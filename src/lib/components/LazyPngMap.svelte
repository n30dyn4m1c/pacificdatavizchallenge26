<script>
	/** LazyPngMap — code-split wrapper around PngMap (chapter four, layer 1). */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);

	onMount(() => {
		import('./PngMap.svelte').then((m) => (Chart = m.default));
	});
</script>

{#if Chart}
	<Chart {...props} />
{:else}
	<div class="chart-skeleton" style:height="100%" aria-hidden="true"></div>
{/if}
