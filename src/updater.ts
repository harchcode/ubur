import { UpdaterInterface, GameInterface, Sphere } from './types';
import { WORLD_L, MAX_SPHERE_R } from './constants';

export class Updater implements UpdaterInterface {
  game: GameInterface;
  onEaten?: (eaten: Sphere) => void;

  constructor(game: GameInterface, onEaten?: (eaten: Sphere) => void) {
    this.game = game;
    this.onEaten = onEaten;
  }

  update = (dt: number) => {
    this.game.world.update(dt, this.updateSphere);
    this.game.world.checkCollisions(this.isCollide, this.onCollision);
  };

  private isCollide(s1: Sphere, s2: Sphere) {
    const distanceSq =
      (s2.x - s1.x) * (s2.x - s1.x) + (s2.y - s1.y) * (s2.y - s1.y);

    const rTotalSq = (s1.r + s2.r) * (s1.r + s2.r);

    return distanceSq <= rTotalSq;
  }

  private onCollision = (sphere1: Sphere, sphere2: Sphere) => {
    const distanceSq =
      (sphere2.x - sphere1.x) * (sphere2.x - sphere1.x) +
      (sphere2.y - sphere1.y) * (sphere2.y - sphere1.y);

    this.absorb(sphere1, sphere2, distanceSq);
  };

  private absorb(sphere1: Sphere, sphere2: Sphere, distanceSq: number) {
    const eater = sphere1.r > sphere2.r ? sphere1 : sphere2;
    const eaten = eater === sphere1 ? sphere2 : sphere1;

    if (distanceSq <= sphere1.r * sphere1.r + sphere2.r * sphere2.r) {
      eater.r = Math.min(
        Math.sqrt(eater.r * eater.r + eaten.r * eaten.r),
        MAX_SPHERE_R
      );
      eaten.r = 0;

      this.onEaten?.(eaten);
      this.game.spheres.free(eaten);
      this.game.world.remove(eaten);

      return;
    }

    const distance = Math.sqrt(distanceSq);

    const r1 =
      distance * 0.5 +
      Math.sqrt(
        0.5 * (eater.r * eater.r + eaten.r * eaten.r) - distanceSq * 0.25
      );

    eater.r = Math.min(r1, MAX_SPHERE_R);
    eaten.r = distance - eater.r;
  }

  private melt(sphere1: Sphere, sphere2: Sphere, distanceSq: number) {
    const bigger = sphere1.r > sphere2.r ? sphere1 : sphere2;
    const smaller = bigger === sphere1 ? sphere2 : sphere1;

    if (distanceSq <= sphere1.r * sphere1.r + sphere2.r * sphere2.r) {
      bigger.r = Math.sqrt(bigger.r * bigger.r - smaller.r * smaller.r);
      smaller.r = 0;

      this.onEaten?.(smaller);
      this.game.spheres.free(smaller);
      this.game.world.remove(smaller);

      return;
    }

    const distance = Math.sqrt(distanceSq);

    bigger.r =
      (bigger.r * bigger.r - smaller.r * smaller.r + distanceSq) /
      (2 * distance);
    smaller.r = distance - bigger.r;
  }

  private updateSphere = (dt: number, sphere: Sphere) => {
    const oldX = sphere.x;
    const oldY = sphere.y;

    sphere.x += sphere.vx * dt;
    sphere.y += sphere.vy * dt;

    const left = sphere.x - sphere.r;
    const right = sphere.x + sphere.r;
    const top = sphere.y + sphere.r;
    const bottom = sphere.y - sphere.r;

    if (left < 0) {
      sphere.x -= left;
      sphere.vx *= -1;
    }

    if (right > WORLD_L) {
      const rem = right - WORLD_L;

      sphere.x -= rem;
      sphere.vx *= -1;
    }

    if (top > WORLD_L) {
      const rem = top - WORLD_L;

      sphere.y -= rem;
      sphere.vy *= -1;
    }

    if (bottom < 0) {
      sphere.y -= bottom;
      sphere.vy *= -1;
    }

    this.game.world.move(sphere, oldX, oldY);
  };
}
