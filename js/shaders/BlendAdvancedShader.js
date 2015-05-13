/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Blend two textures
 */

THREE.BlendAdvancedShader = {

	uniforms: {

		"tDiffuse1": { type: "t", value: null },
		"tDiffuse2": { type: "t", value: null },
		"mixRatio":  { type: "f", value: 0.1 },
		"opacity":   { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",
		//"uniform float mixRatio;",

		"uniform sampler2D tDiffuse1;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tDiffuse1, vUv );",
			"vec4 texel2 = texture2D( tDiffuse2, vUv );",
                        //"float mix = texel1.w / (texel1.w + texel2.w);",
			//"gl_FragColor = opacity * mix( texel2, texel1, texel1.w / (texel1.w + texel2.w) );",
                        "gl_FragColor = opacity * mix( texel2, texel1, texel1.w );",
                        //"gl_FragColor = opacity * mix( texel2, texel1, texel1.w * .5 );",
		"}"

	].join("\n")

};
