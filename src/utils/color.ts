export type Color = [number, number, number, number];

export function rgba(r: number, g: number, b: number, a: number): Color {
  return [r / 255, g / 255, b / 255, a / 255];
}

export function rgb(r: number, g: number, b: number): Color {
  return rgba(r, g, b, 255);
}

export function hex(str: string): Color {
  const r = parseInt(str.substring(1, 3), 16);
  const g = parseInt(str.substring(3, 5), 16);
  const b = parseInt(str.substring(5, 7), 16);
  const a = str.length === 7 ? 255 : parseInt(str.substring(7, 9), 16);

  return rgba(r, g, b, a);
}
