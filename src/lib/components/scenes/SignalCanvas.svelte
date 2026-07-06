<script>
	/**
	 * SignalCanvas — the raw-WebGL layer for Scene 1, split into its own chunk
	 * and dynamically imported by SignalHero. It carries the heavy client-only
	 * code (GL init + the two shader sources, imported `?raw`), so none of it
	 * lands in the initial page bundle. It is loaded ONLY when the hero decides
	 * a live shader is warranted — i.e. motion is allowed, WebGL is present and
	 * the scene's grids have arrived. Under prefers-reduced-motion the hero
	 * never imports this file at all and the static poster crossfade stands in.
	 *
	 * It draws the anomaly field over the poster backdrop the hero already
	 * shows; if WebGL init fails it renders nothing and the posters remain.
	 */
	import { onMount } from 'svelte';
	import { anomalyGLSL, fieldGLSL } from '$lib/palette.js';
	import vertSrc from '$lib/shaders/sst.vert?raw';
	import fragBody from '$lib/shaders/sst.frag?raw';
	import { ui } from '$lib/state.svelte.js';

	let { progress = 0, active = false, data = null } = $props();

	let canvas = $state(null);
	let webglOk = $state(true);
	let glReady = $state(false);

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
		const idxF = Math.min(1, p / 0.8) * (textures.length - 1);
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

{#if webglOk}
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
{/if}

<style>
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
</style>
