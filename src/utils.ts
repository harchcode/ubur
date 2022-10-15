/* eslint no-param-reassign: 0 */

export function setColorArr(out: Float32Array, color: number, opacity = 1) {
  color |= 0;

  out[3] = opacity;

  for (let i = 2; i >= 0; i--) {
    out[i] = (color % 0x100) / 0xff;
    color = (color / 0x100) | 0;
  }
}
