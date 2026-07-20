/**
 * reveal — the one entrance-motion convention for static (non-scrolly)
 * content: chapter heads, big stats, shelf cards. An IntersectionObserver
 * adds `.reveal` at mount (browser only — prerendered HTML never ships a
 * hidden state) and `.reveal-in` as the element approaches the viewport,
 * so blocks settle up into place exactly once.
 *
 * Entirely inert under prefers-reduced-motion: the classes are never
 * added, the element renders in its resting state. Styles live in
 * app.css (`.reveal` / `.reveal-in`); `delay` staggers siblings via
 * `--reveal-delay`.
 */
export function reveal(node, opts = {}) {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const { delay = 0 } = opts;
	if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`);
	node.classList.add('reveal');
	const io = new IntersectionObserver(
		(entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				node.classList.add('reveal-in');
				io.disconnect();
			}
		},
		// fire slightly inside the viewport so the settle is seen, not missed
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
	);
	io.observe(node);
	return {
		destroy() {
			io.disconnect();
		}
	};
}
