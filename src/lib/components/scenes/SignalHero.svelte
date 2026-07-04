<script>
	/**
	 * The WebGL hero for Scene 1 (raw WebGL, no three.js). Receives
	 * { progress, active, data } from the scene's ScrollScene snippet.
	 * See Scene1Signal.svelte for the scene shell and prose.
	 */
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { anomalyGLSL, fieldGLSL } from '$lib/palette.js';
	import vertSrc from '$lib/shaders/sst.vert?raw';
	import fragBody from '$lib/shaders/sst.frag?raw';
	import { ui } from '$lib/state.svelte.js';

	let { progress = 0, active = false, data = null } = $props();

	let canvas = $state(null);
	let webglOk = $state(true);
	let glReady = $state(false);

	// scrub reaches the latest month at 80% progress; the last 20% pins there
	const timeP = $derived(Math.min(1, progress / 0.8));

	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const label = (date) => {
		const [y, m] = date.split('-');
		return `${MONTHS[+m - 1]} ${y}`;
	};

	let gl = null;
	let uni = {};
	let textures = [];
	let t0 = 0;

	function initGL() {
		gl = canvas.getContext('webgl', { antialias: false, alpha: false });
		if (!gl) {
			webglOk = false;
			return;
		}
		const fragSrc =
			'precision mediump float;\n' + anomalyGLSL('dark') + fieldGLSL('dark') + fragBody;
		const compile = (type, src) => {
			const s = gl.createShader(type);
			gl.shaderSource(s, src);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
				console.error(gl.getShaderInfoLog(s));
				return null;
			}
			return s;
		};
		const vs = compile(gl.VERTEX_SHADER, vertSrc);
		const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
		if (!vs || !fs) {
			webglOk = false;
			return;
		}
		const prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			webglOk = false;
			return;
		}
		gl.useProgram(prog);

		// fullscreen triangle
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const loc = gl.getAttribLocation(prog, 'a_pos');
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

		for (const name of ['u_texA', 'u_texB', 'u_mix', 'u_time', 'u_zoom']) {
			uni[name] = gl.getUniformLocation(prog, name);
		}

		// one tiny LUMINANCE texture per month (72×24 bytes each)
		textures = data.grids.map((b64) => {
			const bin = atob(b64);
			const bytes = new Uint8Array(bin.length);
			for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
			const tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, data.w, data.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			return tex;
		});
		t0 = performance.now();
		glReady = true;
		render(progress);
	}

	function resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		const cw = Math.round(canvas.clientWidth * dpr);
		const ch = Math.round(canvas.clientHeight * dpr);
		if (canvas.width !== cw || canvas.height !== ch) {
			canvas.width = cw;
			canvas.height = ch;
			gl.viewport(0, 0, cw, ch);
		}
	}

	function render(p) {
		if (!gl || !textures.length) return;
		resize();
		const tp = Math.min(1, p / 0.8);
		const idxF = tp * (textures.length - 1);
		const i = Math.min(textures.length - 2, Math.floor(idxF));
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, textures[i]);
		gl.uniform1i(uni.u_texA, 0);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, textures[i + 1]);
		gl.uniform1i(uni.u_texB, 1);
		gl.uniform1f(uni.u_mix, idxF - i);
		gl.uniform1f(uni.u_time, ui.reducedMotion ? 0 : (performance.now() - t0) / 1000);
		gl.uniform1f(uni.u_zoom, 1 + 0.12 * p);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	$effect(() => {
		if (data && canvas && !gl && webglOk) initGL();
	});

	// rAF loop only while on screen and motion is allowed
	$effect(() => {
		if (active && glReady && !ui.reducedMotion) {
			let raf = requestAnimationFrame(function loop() {
				render(progress);
				raf = requestAnimationFrame(loop);
			});
			return () => cancelAnimationFrame(raf);
		}
	});

	// otherwise redraw only when scroll moves (static frame per position)
	$effect(() => {
		if (glReady && (ui.reducedMotion || !active)) render(progress);
	});

	onMount(() => {
		const onResize = () => glReady && render(progress);
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
</script>

<div class="hero">
	{#if webglOk}
		<canvas bind:this={canvas} aria-hidden="true"></canvas>
	{:else}
		<!-- no-WebGL fallback: pre-rendered posters, CSS crossfade -->
		<div class="posters" aria-hidden="true">
			<img src="{base}/posters/sst_cool.png" alt="" />
			<img src="{base}/posters/sst_warm.png" alt="" style:opacity={timeP} />
		</div>
	{/if}

	<div class="title-block" style:opacity={Math.max(0, 1 - progress * 5)}>
		<p class="kicker">Pacific Data Viz Challenge 2026 · Papua New Guinea</p>
		<h1 class="display">The Ocean<br />Knows First</h1>
		<p class="standfirst">
			How a warming stripe of Pacific seawater becomes, months later, drought on the Fly River
			and frost in the highland gardens — and why those months are a gift.
		</p>
		<span class="scroll-hint">scroll ↓</span>
	</div>

	{#if data}
		{@const m = data.months[Math.round(timeP * (data.months.length - 1))]}
		<div class="date-readout" style:opacity={progress > 0.04 && progress < 0.78 ? 1 : 0}>
			<span class="kicker">Niño 3.4 region · sea-surface temperature anomaly</span>
			<span class="date display">{label(m.date)}</span>
			<span class="val">{m.oni > 0 ? '+' : ''}{m.oni.toFixed(1)} °C</span>
		</div>

		<div class="latest" style:opacity={Math.max(0, (progress - 0.82) / 0.12)}>
			<span class="big-numeral" style="color:var(--accent-dark)">
				+{data.latest.oni.toFixed(1)} °C
			</span>
			<span class="latest-caption">
				{label(data.latest.date)} — and rising. A strong El Niño is under way.
			</span>
		</div>
	{/if}
</div>

<style>
	.hero {
		position: relative;
		height: 100%;
	}

	canvas,
	.posters {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.posters img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.2s linear;
	}

	.title-block {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 1.5rem;
		pointer-events: none;
	}

	h1 {
		font-size: clamp(2.8rem, 10vw, 6.5rem);
		font-weight: 900;
		margin: 0.4em 0;
		text-shadow: 0 2px 30px rgba(0, 0, 0, 0.6);
	}

	.standfirst {
		max-width: 36em;
		color: var(--ink-dark-secondary);
	}

	.scroll-hint {
		margin-top: 2.5rem;
		font-size: 0.8rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--ink-dark-muted);
		animation: bob 2.2s ease-in-out infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-hint {
			animation: none;
		}
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(8px);
		}
	}

	.date-readout {
		position: absolute;
		left: 1.5rem;
		bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		transition: opacity 0.3s;
	}

	.date {
		font-size: clamp(1.6rem, 4.5vw, 2.6rem);
		font-weight: 700;
		font-family: Fraunces, Georgia, serif;
	}

	.val {
		font-variant-numeric: tabular-nums;
		color: var(--ink-dark-secondary);
	}

	.latest {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: 0.75rem;
		pointer-events: none;
	}

	.latest-caption {
		max-width: 26em;
		color: var(--ink-dark-secondary);
		text-shadow: 0 1px 12px rgba(0, 0, 0, 0.7);
	}
</style>
