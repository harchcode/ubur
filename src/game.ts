import {
  UpdaterInterface,
  DrawerInterface,
  GameInterface,
  Sphere,
  PoolInterface
} from './types';
import { GameLoop } from './game-loop';
import { Pool } from './pool';
import { randInt } from './utils/math';
import {
  WORLD_L,
  SPHERE_COLORS,
  MAX_SPHERE_R,
  STARTING_SPHERE_R
} from './constants';
import { Grid } from './grid';

export class Game implements GameInterface {
  spheres: PoolInterface<Sphere>;
  grid: Grid;

  constructor() {
    this.spheres = new Pool<Sphere>(
      () => ({
        id: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: 0,
        colorIndex: 0
      }),
      (obj: Sphere) => {
        obj.x = 0;
        obj.y = 0;
        obj.vx = 0;
        obj.vy = 0;
        obj.r = 0;
        obj.colorIndex = 0;
      }
    );

    this.grid = new Grid();
  }

  start = (updater: UpdaterInterface, drawer?: DrawerInterface) => {
    for (let i = 0; i < 100; i++) {
      const tmp = this.spheres.obtain();

      tmp.x = randInt(0, WORLD_L);
      tmp.y = randInt(0, WORLD_L);
      tmp.r = randInt(STARTING_SPHERE_R, MAX_SPHERE_R);
      tmp.vx = randInt(-100, 100);
      tmp.vy = randInt(-100, 100);
      tmp.colorIndex = randInt(0, SPHERE_COLORS.length - 1);

      this.grid.insert(tmp);
    }

    const loop = new GameLoop(updater, drawer);
    loop.start();
  };
}
