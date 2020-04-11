import {
  UpdaterInterface,
  DrawerInterface,
  GameInterface,
  Sphere,
  PoolInterface,
  SphereType,
  ShootCommand
} from './types';
import { GameLoop } from './game-loop';
import { Pool } from './pool';
import { randInt, rand } from './utils/math';
import {
  WORLD_L,
  PLAYER_COLORS,
  FOOD_SPAWN_R_MIN,
  FOOD_SPAWN_R_MAX,
  FOOD_COLORS,
  AM_SPAWN_R_MIN,
  AM_SPAWN_R_MAX,
  STARTING_PLAYER_R,
  STARTING_PLAYER_R_RANDOMNESS
} from './constants';
import { World } from './world';

export class Game implements GameInterface {
  spheres: PoolInterface<Sphere>;
  commands: PoolInterface<ShootCommand>;
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

    this.commands = new Pool<ShootCommand>(
      () => ({
        id: 0,
        shooter: null,
        dirx: 0,
        diry: 0
      }),
      (obj: ShootCommand) => {
        obj.shooter = null;
        obj.dirx = 0;
        obj.diry = 0;
      }
    );

    this.world = new World();
  }

  start = (updater: UpdaterInterface, drawer?: DrawerInterface) => {
    for (let i = 0; i < 10; i++) {
      this.spawnAM();
    }

    for (let i = 0; i < 500; i++) {
      this.spawnFood();
    }

    for (let i = 0; i < 100; i++) {
      this.spawnPlayer('Player');
    }

    const loop = new GameLoop(updater, drawer);
    loop.start();
  };

  spawnFood = () => {
    const newSphere = this.spheres.obtain();

    newSphere.type = SphereType.FOOD;
    newSphere.name = '';
    newSphere.r = rand(FOOD_SPAWN_R_MIN, FOOD_SPAWN_R_MAX);
    newSphere.x = rand(newSphere.r, WORLD_L - newSphere.r);
    newSphere.y = rand(newSphere.r, WORLD_L - newSphere.r);
    newSphere.vx = 0;
    newSphere.vy = 0;
    newSphere.colorIndex = randInt(0, FOOD_COLORS.length - 1);

    this.world.insert(newSphere);

    return newSphere;
  };

  spawnAM = () => {
    const newSphere = this.spheres.obtain();

    newSphere.type = SphereType.AM;
    newSphere.name = '';
    newSphere.r = rand(AM_SPAWN_R_MIN, AM_SPAWN_R_MAX);
    newSphere.x = rand(newSphere.r, WORLD_L - newSphere.r);
    newSphere.y = rand(newSphere.r, WORLD_L - newSphere.r);
    newSphere.vx = 0;
    newSphere.vy = 0;
    newSphere.colorIndex = 0;

    this.world.insert(newSphere);

    return newSphere;
  };

  spawnPlayer = (name: string) => {
    const newSphere = this.spheres.obtain();

    newSphere.type = SphereType.PLAYER;
    newSphere.name = name || 'Anon';
    newSphere.r = rand(
      STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
      STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS
    );
    newSphere.x = rand(newSphere.r, WORLD_L - newSphere.r);
    newSphere.y = rand(newSphere.r, WORLD_L - newSphere.r);
    newSphere.vx = 10;
    newSphere.vy = 5;
    newSphere.colorIndex = randInt(0, PLAYER_COLORS.length - 1);

    this.world.insert(newSphere);

    return newSphere;
  };

  shoot = (sphere: Sphere, dirx: number, diry: number) => {
    const command = this.commands.obtain();

    command.shooter = sphere;
    command.dirx = dirx;
    command.diry = diry;
  };
}
