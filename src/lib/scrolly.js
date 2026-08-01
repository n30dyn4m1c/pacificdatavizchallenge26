/**
 * scrolly.js — the one convention for card-driven scenes.
 *
 * A scene is a tall runway with a 100vh sticky graphic and N step cards
 * scrolling past it. The card column is pulled back over the pin
 * (margin-top:-100svh), so the runway is LEAD_VH + N·SLOT_VH: one slot per
 * card, plus a short lead-out so the scene hands over the moment the last
 * card has been read (the old convention left a whole empty viewport of
 * graphic at the end of every chapter — nine chapters of dead scroll).
 *
 * SLOT_VH is deliberately under 100: a card does not need a full screen of
 * travel to be read, and shortening the slot is what keeps a nine-chapter
 * piece inside a reasonable scroll budget. It is mirrored into CSS as
 * `--slot-vh` (app.css) — change it here and the layout follows.
 */
export const SLOT_VH = 90;
export const LEAD_VH = 55;

/** Runway height (vh) for a scene with `n` step cards. */
export const runwayVh = (n) => LEAD_VH + n * SLOT_VH;

/** Total scrollable travel (vh) inside that runway — the span `progress` maps to. */
const travelVh = (n) => runwayVh(n) - 100;

/**
 * Active card = the one whose slot centre is nearest the viewport centre.
 * Card i's centre sits at i·SLOT + SLOT/2 − 50 vh of travel, so inverting
 * that gives the index directly.
 */
export const cardIndex = (progress, n) => {
	const s = progress * travelVh(n);
	const i = Math.round((s + 50 - SLOT_VH / 2) / SLOT_VH);
	return Math.max(0, Math.min(n - 1, i));
};

/** 0–1 ramp that completes partway through the first card (chart draw-in). */
export const sweep = (progress, n, speed = 1.6) =>
	Math.max(0, Math.min(1, progress * n * speed));

export const clamp01 = (v) => Math.max(0, Math.min(1, v));
