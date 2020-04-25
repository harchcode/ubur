const ONE_OVER_PI = 1 / Math.PI;

export function circleRadiusFromArea(area: number) {
  return Math.sqrt(area * ONE_OVER_PI);
}

export function circleAreaFromRadius(radius: number) {
  return Math.PI * radius * radius;
}

// inclusive
export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// exclusive
export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function nextPowerOf2(value: number): number {
  if (value <= 0) return 1;

  let result = value;

  result--;
  result |= result >> 1;
  result |= result >> 2;
  result |= result >> 4;
  result |= result >> 8;
  result |= result >> 16;
  result++;

  return result;
}
