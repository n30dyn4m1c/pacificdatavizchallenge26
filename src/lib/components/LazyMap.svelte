<script>
	/**
	 * LazyMap — code-split wrapper around PacificMap (chapter one). Same
	 * contract as the other Lazy* wrappers: the chunk loads when the scene
	 * mounts it, a sized skeleton holds the space until then.
	 */
	import { onMount } from 'svelte';

	let props = $props();
	let Chart = $state(null);
	let failed = $state(false);

	onMount(() => {
		import('./PacificMap.svelte')
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
