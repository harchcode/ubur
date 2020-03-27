import { UpdaterInterface, GameInterface, Sphere } from './types';
import { WORLD_L } from './constants';
import { randInt } from './utils/math';

export class Updater implements UpdaterInterface {
  game: GameInterface;

  constructor(game: GameInterface) {
    this.game = game;
  }

  update = (dt: number) => {
    this.updateSpheres(dt);
    this.checkCollisions();
  };

  private isCollide(s1: Sphere, s2: Sphere) {
    const distanceSq =
      (s2.x - s1.x) * (s2.x - s1.x) + (s2.y - s1.y) * (s2.y - s1.y);

    const rTotalSq = (s1.r + s2.r) * (s1.r + s2.r);

    return distanceSq <= rTotalSq;
  }

  private onCollision(s1: Sphere, s2: Sphere) {
    s1.colorIndex = randInt(0, 6);
    s2.colorIndex = randInt(0, 6);
  }

  private checkCollisions = () => {
    this.game.grid.checkCollisions(this.isCollide, this.onCollision);
  };

  private updateSpheres = (dt: number) => {
    const { spheres } = this.game;

    for (const k in spheres.objs) {
      if (!spheres.isAlive[k]) continue;

      const sphere = spheres.objs[k];

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

      this.game.grid.move(sphere, oldX, oldY);
    }
  };
}
