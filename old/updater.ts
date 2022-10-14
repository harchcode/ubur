import {
  UpdaterInterface,
  GameInterface,
  Sphere,
  SphereType,
  ShootCommand
} from './types';
import {
  WORLD_L,
  MAX_SPHERE_R,
  SHOOT_FORCE,
  MAX_SPHERE_SPEED,
  SHOOT_AREA_RATIO,
  R_DECREASE_RATIO,
  FOOD_SPAWN_DELAY,
  AM_SPAWN_DELAY,
  MAX_SPHERE_COUNT
} from './constants';

export class Updater implements UpdaterInterface {
  game: GameInterface;
  onEaten?: (eaten: Sphere) => boolean;

  private foodSpawnCounter = 0;
  private amSpawnCounter = 0;

  constructor(game: GameInterface, onEaten?: (eaten: Sphere) => boolean) {
    this.game = game;
    this.onEaten = onEaten;
  }

  update = (dt: number) => {
    this.foodSpawnCounter += dt;
    this.amSpawnCounter += dt;

    if (this.foodSpawnCounter >= FOOD_SPAWN_DELAY) {
      this.foodSpawnCounter -= FOOD_SPAWN_DELAY;

      if (this.game.spheres.count() < MAX_SPHERE_COUNT) this.game.spawnFood();
    }

    if (this.amSpawnCounter >= AM_SPAWN_DELAY) {
      this.amSpawnCounter -= AM_SPAWN_DELAY;

      if (this.game.spheres.count() < MAX_SPHERE_COUNT) this.game.spawnAM();
    }

    this.game.commands.forEach(this.handleCommand);

    this.game.world.update(dt, this.updateSphere);
    this.game.world.checkCollisions(this.isCollide, this.onCollision);
  };

  private handleCommand = (command: ShootCommand) => {
    const { shooter } = command;

    if (!shooter) return;

    shooter.vx -= command.dirx * SHOOT_FORCE;
    shooter.vy -= command.diry * SHOOT_FORCE;

    const speedSq = shooter.vx * shooter.vx + shooter.vy * shooter.vy;

    if (speedSq > MAX_SPHERE_SPEED * MAX_SPHERE_SPEED) {
      const speed = Math.sqrt(speedSq);

      shooter.vx = (shooter.vx / speed) * MAX_SPHERE_SPEED;
      shooter.vy = (shooter.vy / speed) * MAX_SPHERE_SPEED;
    }

    this.game.spawnBullet(shooter, command.dirx, command.diry);

    shooter.r *= SHOOT_AREA_RATIO;

    this.game.commands.free(command);
  };

  private isCollide(s1: Sphere, s2: Sphere) {
    const distanceSq =
      (s2.x - s1.x) * (s2.x - s1.x) + (s2.y - s1.y) * (s2.y - s1.y);

    const rTotalSq = (s1.r + s2.r) * (s1.r + s2.r);

    return distanceSq <= rTotalSq;
  }

  private onCollision = (sphere1: Sphere, sphere2: Sphere) => {
    if (sphere1.shooter === sphere2 || sphere2.shooter === sphere1) return;

    const distanceSq =
      (sphere2.x - sphere1.x) * (sphere2.x - sphere1.x) +
      (sphere2.y - sphere1.y) * (sphere2.y - sphere1.y);

    const bigger = sphere1.r > sphere2.r ? sphere1 : sphere2;
    const smaller = bigger === sphere1 ? sphere2 : sphere1;

    if (sphere1.type === SphereType.AM || sphere2.type === SphereType.AM) {
      this.melt(bigger, smaller, distanceSq);
    } else if (
      (bigger.type === SphereType.FOOD || bigger.type === SphereType.BULLET) &&
      smaller.type !== SphereType.FOOD &&
      smaller.type !== SphereType.BULLET
    ) {
      this.absorb(smaller, bigger, distanceSq);
    } else {
      this.absorb(bigger, smaller, distanceSq);
    }
  };

  private freeSphere = (sphere: Sphere) => {
    if (sphere.type === SphereType.PLAYER) {
      if (!this.onEaten?.(sphere)) this.game.respawnFakePlayer(sphere);

      this.game.players.free(sphere);
    } else {
      this.game.spheres.free(sphere);
    }

    this.game.world.remove(sphere);
  };

  private absorb(eater: Sphere, eaten: Sphere, distanceSq: number) {
    if (distanceSq <= eater.r * eater.r + eaten.r * eaten.r) {
      eater.r = Math.min(
        Math.sqrt(eater.r * eater.r + eaten.r * eaten.r),
        MAX_SPHERE_R
      );
      eaten.r = 0;

      this.freeSphere(eaten);

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

  private melt(bigger: Sphere, smaller: Sphere, distanceSq: number) {
    if (distanceSq <= bigger.r * bigger.r + smaller.r * smaller.r) {
      bigger.r = Math.sqrt(bigger.r * bigger.r - smaller.r * smaller.r);
      smaller.r = 0;

      this.freeSphere(smaller);

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

    sphere.r -= R_DECREASE_RATIO * sphere.r * dt;

    sphere.x += sphere.vx * dt;
    sphere.y += sphere.vy * dt;

    const left = sphere.x - sphere.r;
    const right = sphere.x + sphere.r;
    const top = sphere.y + sphere.r;
    const bottom = sphere.y - sphere.r;

    if (left < 0) {
      sphere.x -= left;
      sphere.vx *= -1;
      sphere.shooter = null;
    }

    if (right > WORLD_L) {
      const rem = right - WORLD_L;

      sphere.x -= rem;
      sphere.vx *= -1;
      sphere.shooter = null;
    }

    if (top > WORLD_L) {
      const rem = top - WORLD_L;

      sphere.y -= rem;
      sphere.vy *= -1;
      sphere.shooter = null;
    }

    if (bottom < 0) {
      sphere.y -= bottom;
      sphere.vy *= -1;
      sphere.shooter = null;
    }

    this.game.world.move(sphere, oldX, oldY);
  };
}
