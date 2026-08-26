<script>
	/**
	 * BigStat — a full-width resting interlude between chapters: one huge
	 * number and one line of caption. The pudding-style "let the stat land"
	 * beat. On approach, the numeral counts up to its value once — a small
	 * physical arrival for the piece's three biggest numbers ("8 / 10",
	 * "+1.1 °C", the latest Niño 3.4 reading). Inert without JS, under
	 * prefers-reduced-motion, and in prerendered HTML: those render the
	 * final value directly and never see the counter.
	 */
	import { onMount } from 'svelte';
	import { reveal } from '$lib/reveal.js';

	let { kicker = '', stat, caption, accent = 'warm' } = $props();

	// tokenize the stat into numbers and the text between them
	const NUM = /([+-]?)(\d[\d,]*(?:\.\d+)?)/g;
	const parts = (() => {
		const out = [];
		let last = 0;
		let m;
		while ((m = NUM.exec(stat ?? '')) !== null) {
			if (m.index > last) out.push({ t: 'txt', s: stat.slice(last, m.index) });
			out.push({
				t: 'num',
				sign: m[1],
				target: parseFloat(m[2].replace(/,/g, '')),
				dec: (m[2].split('.')[1] ?? '').length,
				grouped: m[2].includes(',')
			});
			last = m.index + m[0].length;
		}
		if (last < stat.length) out.push({ t: 'txt', s: stat.slice(last) });
		return out;
	})();
	const hasNum = parts.some((p) => p.t === 'num');

	let k = $state(1); // 0→1 count progress; 1 = final value (the no-JS default)
	let el;

	function fmt(p) {
		const v = p.target * k;
		const s = p.grouped
			? Math.round(v).toLocaleString('en-US')
			: v.toFixed(p.dec);
		return `${p.sign}${s}`;
	}

	onMount(() => {
		if (!hasNum || !el) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let raf = 0;
		const io = new IntersectionObserver(
			(entries) => {
				if (!entries.some((e) => e.isIntersecting)) return;
				io.disconnect();
				k = 0;
				const t0 = performance.now();
				const DUR = 1150;
				const step = (now) => {
					const q = Math.min(1, (now - t0) / DUR);
					k = 1 - Math.pow(1 - q, 3);
					if (q < 1) raf = requestAnimationFrame(step);
				};
				raf = requestAnimationFrame(step);
			},
			// fire as the stat settles into view, not a screen early
			{ rootMargin: '0px 0px -14% 0px', threshold: 0.25 }
		);
		io.observe(el);
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	});
</script>

<section class="bigstat" aria-label="{stat} — {caption}">
	{#if kicker}
		<p class="kicker" use:reveal>{kicker}</p>
	{/if}
	<p
		class="stat display reveal-pop"
		class:warm={accent === 'warm'}
		class:cool={accent === 'cool'}
		bind:this={el}
		use:reveal={{ delay: 110 }}
	>
		{#each parts as p, i (i)}{#if p.t === 'num'}{fmt(p)}{:else}{p.s}{/if}{/each}
	</p>
	<p class="caption" use:reveal={{ delay: 260 }}>{caption}</p>
</section>

<style>
	.bigstat {
		min-height: 72vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 4rem 1.5rem;
		gap: 0.75rem;
	}

	.stat {
		font-size: clamp(4rem, 16vw, 10rem);
		line-height: 1;
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.stat.warm {
		color: var(--warm);
	}

	.stat.cool {
		color: var(--cool);
	}

	.caption {
		font-size: clamp(1.05rem, 2.4vw, 1.35rem);
		font-family: Fraunces, Georgia, serif;
		font-weight: 700;
		max-width: 26em;
		text-wrap: balance;
		margin: 0;
	}
</style>
