/** Global UI state (Svelte 5 runes). */
export const ui = $state({
	/** Reader mode reveals every scene's prose equivalent. */
	readerMode: false,
	/** Mirrors prefers-reduced-motion; set once in +layout.svelte. */
	reducedMotion: false
});
