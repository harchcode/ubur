attribute vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_transform;
uniform mat3 u_projection;

varying vec2 v_position;

void main() {
  vec2 position = (u_projection * u_transform * vec3(a_position, 1)).xy;

  gl_Position = vec4(position, 0, 1);

  v_position = a_position;
}
