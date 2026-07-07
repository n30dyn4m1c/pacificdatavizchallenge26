/**
 * scrolly.js — the one convention for card-driven scenes.
 *
 * A scene with N step cards uses heightVh = (N + 1) * 100: one viewport for
 * the pinned graphic plus one per card (the card column is pulled back over
 * the graphic with margin-top:-100svh). With ScrollScene's pin-relative
 * progress, card i is centered in the viewport exactly at progress i/N, so
 * the active card — and the graphic state that goes with it — is the nearest
 * card center.
 */
export const cardIndex = (progress, n) =>
	Math.max(0, Math.min(n - 1, Math.round(progress * n)));

/** 0–1 ramp that completes partway through the first card (chart draw-in). */
export const sweep = (progress, n, speed = 1.6) =>
	Math.max(0, Math.min(1, progress * n * speed));

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
