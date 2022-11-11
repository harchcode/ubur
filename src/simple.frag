#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;

varying vec2 v_position;

uniform vec4 u_color;
uniform bool u_circle;

void main(void) {
  float alpha = 1.0;

  if (u_circle) {
    vec2 cxy = 2.0 * v_position;
    float r = dot(cxy, cxy);

    #ifdef GL_OES_standard_derivatives
      float delta = fwidth(r);
    #else
      float delta = 0.01;
    #endif

    alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
  }

  gl_FragColor = u_color * alpha;
}
