/** Global UI state (Svelte 5 runes). */
export const ui = $state({
	/** Reader mode reveals every scene's prose equivalent. */
	readerMode: false,
	/** Mirrors prefers-reduced-motion; set once in +layout.svelte. */
	reducedMotion: false,
	/**
	 * ?notap=1 dev proofing mode: every optional interactive affordance
	 * (beats, hotspots, toggles, selectors) renders nothing, so the
	 * scroll-only narrative can be proof-read on its own. The scroll must
	 * always tell the complete story — notap only removes enrichment.
	 */
	noTap: false,
	/**
	 * The reader's current month in Pacific/Port_Moresby time, {y, m(1-12)}.
	 * Computed CLIENT-SIDE in +layout.svelte — the "you are here" marker has
	 * no pipeline dependency. Dev override: ?now=YYYY-MM-DD. Null until mount
	 * (prerendered HTML treats every window as "ahead", never falsely closed).
	 */
	now: null,
	/**
	 * ?province=<slug> from a shared link: reserved for future per-province
	 * views. Unused by the current annual-record scenes.
	 */
	province: null
});
