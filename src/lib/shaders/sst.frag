precision mediump float;

// The palette functions anomalyColor(float) and fieldColor(float) are
// generated from src/lib/palette.js and prepended at runtime — the shader
// and the SVG charts share one anomaly scale by construction.
// __PALETTE_GLSL__ is injected above this file's contents.

varying vec2 v_uv;

uniform sampler2D u_texA; // month m   (LUMINANCE, byte = anomaly*40+128)
uniform sampler2D u_texB; // month m+1
uniform float u_mix; //      fraction between months
uniform float u_time; //     seconds; frozen under prefers-reduced-motion
uniform float u_zoom; //     scroll-driven camera, 1.0 → ~1.12

float texAnom(sampler2D t, vec2 uv) {
	return (texture2D(t, uv).r * 255.0 - 128.0) / 40.0;
}

void main() {
	// scroll-driven camera: slow push-in toward the warm tongue
	vec2 uv = (v_uv - 0.5) / u_zoom + 0.5;

	// gentle water shimmer (u_time is frozen for reduced motion)
	uv.x += 0.006 * sin(uv.y * 34.0 + u_time * 0.7);
	uv.y += 0.006 * sin(uv.x * 22.0 - u_time * 0.5);

	float a = mix(texAnom(u_texA, uv), texAnom(u_texB, uv), u_mix);
	vec3 c = fieldColor(a);

	// vignette so overlaid type stays readable
	float d = distance(v_uv, vec2(0.5));
	c *= 1.0 - 0.4 * smoothstep(0.3, 0.75, d);

	gl_FragColor = vec4(c, 1.0);
}
