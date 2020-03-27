#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;

varying vec4 vPosition;
uniform vec4 uColor;
uniform bool uCircle;

void main(void) {
  float alpha = 1.0;

  if (uCircle) {
    vec2 cxy = 2.0 * vPosition.xy;
    float r = dot(cxy, cxy);

    #ifdef GL_OES_standard_derivatives
      float delta = fwidth(r);
    #else
      float delta = 0.01;
    #endif

    alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
  }

  gl_FragColor = uColor * alpha;
}
