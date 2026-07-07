<script>
	/**
	 * LazyMap — code-split wrapper around PacificMap (chapter one). Same
	 * contract as the other Lazy* wrappers: the chunk loads when the scene
	 * mounts it, a sized skeleton holds the space until then.
	 */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);

	onMount(() => {
		import('./PacificMap.svelte').then((m) => (Chart = m.default));
	});
</script>

{#if Chart}
	<Chart {...props} />
{:else}
	<div class="chart-skeleton" style:aspect-ratio="1000 / 393" aria-hidden="true"></div>
{/if}
