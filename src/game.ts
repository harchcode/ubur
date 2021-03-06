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
  STARTING_PLAYER_R_RANDOMNESS,
  BULLET_AREA_RATIO,
  BULLET_SPEED,
  MAX_SPHERE_SPEED,
  FAKE_PLAYER_NAMES
} from './constants';
import { World } from './world';

export class Game implements GameInterface {
  spheres: PoolInterface<Sphere>;
  players: PoolInterface<Sphere>;
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
        colorIndex: 0,
        shooter: null
      }),
      (obj: Sphere) => {
        obj.x = 0;
        obj.y = 0;
        obj.vx = 0;
        obj.vy = 0;
        obj.r = 0;
        obj.colorIndex = 0;
        obj.shooter = null;
      }
    );

    this.players = new Pool<Sphere>(
      () => ({
        id: 0,
        name: 'Sphere',
        type: SphereType.PLAYER,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: 0,
        colorIndex: 0,
        shooter: null
      }),
      (obj: Sphere) => {
        obj.x = 0;
        obj.y = 0;
        obj.vx = 0;
        obj.vy = 0;
        obj.r = 0;
        obj.colorIndex = 0;
        obj.shooter = null;
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

    for (let i = 0; i < 99; i++) {
      this.spawnFakePlayer(this.getRandomFakeName());
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
    const newSphere = this.players.obtain();

    newSphere.type = SphereType.PLAYER;
    newSphere.name = name || 'Anon';
    newSphere.r = rand(
      STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
      STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS
    );
    newSphere.x = randInt(newSphere.r, WORLD_L - newSphere.r);
    newSphere.y = randInt(newSphere.r, WORLD_L - newSphere.r);
    newSphere.vx = 0;
    newSphere.vy = 0;
    newSphere.colorIndex = randInt(0, PLAYER_COLORS.length - 1);

    this.world.insert(newSphere);

    return newSphere;
  };

  private getRandomFakeName = () => {
    return FAKE_PLAYER_NAMES[randInt(0, FAKE_PLAYER_NAMES.length - 1)];
  };

  respawnFakePlayer = (prev: Sphere) => {
    const rename = randInt(1, 100);

    return this.spawnFakePlayer(
      rename < 90 ? prev.name : this.getRandomFakeName()
    );
  };

  spawnFakePlayer = (name: string) => {
    const newSphere = this.players.obtain();

    newSphere.type = SphereType.PLAYER;
    newSphere.name = name || 'Fake Player';
    newSphere.r = rand(
      STARTING_PLAYER_R - STARTING_PLAYER_R_RANDOMNESS,
      STARTING_PLAYER_R + STARTING_PLAYER_R_RANDOMNESS
    );
    newSphere.x = randInt(newSphere.r, WORLD_L - newSphere.r);
    newSphere.y = randInt(newSphere.r, WORLD_L - newSphere.r);

    const speed = rand(1, MAX_SPHERE_SPEED * 0.9);
    const dirx = rand(0, 1);
    const diry = Math.sqrt(1 - dirx);

    newSphere.vx = dirx * speed;
    newSphere.vy = diry * speed;
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

  spawnBullet = (shooter: Sphere, dirx: number, diry: number) => {
    const newSphere = this.spheres.obtain();

    newSphere.type = SphereType.BULLET;
    newSphere.name = '';
    newSphere.r = shooter.r * BULLET_AREA_RATIO;
    newSphere.x = shooter.x + dirx * (shooter.r - newSphere.r);
    newSphere.y = shooter.y + diry * (shooter.r - newSphere.r);
    newSphere.vx = dirx * BULLET_SPEED;
    newSphere.vy = diry * BULLET_SPEED;
    newSphere.colorIndex = shooter.colorIndex;
    newSphere.shooter = shooter;

    this.world.insert(newSphere);

    return newSphere;
  };
}
