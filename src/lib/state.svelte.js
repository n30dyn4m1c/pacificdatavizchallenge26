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
	noTap: false
});

/**
 * The persistent lag ticker — "months since the ocean signal". Scene 4
 * drives `months` while its runway is scrubbed; scenes 5 and 6 each add a
 * small scroll-driven increment so the reader carries the clock with them.
 * Scene 7 dismisses it for good (the calendar takes over as the time object).
 */
export const lag = $state({
	/** T+n as of the reader's position in scene 4 (-1 = before onset). */
	baseMonths: -1,
	/** true once scene 4's runway has been fully scrolled past. */
	scene4Done: false,
	/** extra months contributed by scrolling scenes 5 and 6. */
	extra5: 0,
	extra6: 0,
	/** scene 4 is on screen. */
	inScene4: false,
	/** scenes 5/6 on screen (each feeds its own flag). */
	carried5: false,
	carried6: false,
	/** scene 7 reached → dismissed (scene 6 re-arms it on back-scroll). */
	dismissed: false
});
