import {
  UpdaterInterface,
  DrawerInterface,
  GameInterface,
  Sphere,
  PoolInterface,
  SphereType
} from './types';
import { GameLoop } from './game-loop';
import { Pool } from './pool';
import { randInt } from './utils/math';
import {
  WORLD_L,
  SPHERE_COLORS,
  STARTING_SPHERE_R,
  MAX_SPHERE_V
} from './constants';
import { World } from './world';

export class Game implements GameInterface {
  spheres: PoolInterface<Sphere>;
  world: World;

  constructor() {
    this.spheres = new Pool<Sphere>(
      () => ({
        id: 0,
        name: 'Sphere',
        type: SphereType.FOOD,
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

    this.world = new World();
  }

  start = (updater: UpdaterInterface, drawer?: DrawerInterface) => {
    for (let i = 0; i < 1000; i++) {
      const tmp = this.spheres.obtain();

      tmp.x = randInt(0, WORLD_L);
      tmp.y = randInt(0, WORLD_L);
      tmp.r = 50;
      tmp.vx = randInt(-MAX_SPHERE_V, MAX_SPHERE_V);
      tmp.vy = randInt(-MAX_SPHERE_V, MAX_SPHERE_V);
      tmp.colorIndex = randInt(0, SPHERE_COLORS.length - 1);

      this.world.insert(tmp);
    }

    const loop = new GameLoop(updater, drawer);
    loop.start();
  };

  spawnPlayer = (name: string) => {
    const newPlayerSphere = this.spheres.obtain();

    newPlayerSphere.name = name || 'Anon';
    newPlayerSphere.x = randInt(0, WORLD_L);
    newPlayerSphere.y = randInt(0, WORLD_L);
    newPlayerSphere.r = 100;
    newPlayerSphere.vx = 50;
    newPlayerSphere.vy = 80;
    newPlayerSphere.colorIndex = randInt(0, SPHERE_COLORS.length - 1);

    this.world.insert(newPlayerSphere);

    return newPlayerSphere;
  };
}
