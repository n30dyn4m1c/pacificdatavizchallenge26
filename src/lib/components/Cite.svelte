<script>
	/**
	 * Cite — a superscript source link. Every verified reported fact in the
	 * piece carries one, pointing at the source URL recorded in the scene
	 * JSON's _meta block (authored in prep/manual/reported_copy.json).
	 * `label` becomes the accessible name and hover title.
	 */
	let { href, label = 'source', n = 1 } = $props();
</script>

<sup class="cite"
	><a {href} target="_blank" rel="noopener noreferrer" aria-label="Source: {label}" title={label}
		>{n}</a
	></sup
>
