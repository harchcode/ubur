export type Sphere = {
  id: number;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  colorIndex: number;
};

export interface WorldInterface {
  insert: (sphere: Sphere) => void;
  remove: (sphere: Sphere) => void;
  move: (sphere: Sphere, oldX: number, oldY: number) => void;

  update: (dt: number, updateFn: (dt: number, sphere: Sphere) => void) => void;
  forEach: (fn: (sphere: Sphere) => void) => void;
  checkCollisions: (
    checkerFunc: (s1: Sphere, s2: Sphere) => boolean,
    onCollisionFunc: (s1: Sphere, s2: Sphere) => void
  ) => void;
}

export interface GameInterface {
  spheres: PoolInterface<Sphere>;
  world: WorldInterface;
  start: (updater: UpdaterInterface, drawer: DrawerInterface) => void;
  spawnPlayer: (name: string) => Sphere;
}

export interface UpdaterInterface {
  update: (dt: number) => void;
}

export interface DrawerInterface {
  readonly playerSphere?: Sphere;
  update: (dt: number) => void;
  draw: () => void;
  resize: (w: number, h: number) => void;
  setPlayerSphere: (sphere?: Sphere) => void;
}

export interface Poolable {
  id: number;
}

export interface PoolInterface<T extends Poolable> {
  objs: Record<number, T>;
  isAlive: Record<number, boolean>;

  get: (id: number) => T;
  obtain: () => T;
  free: (obj: T | number) => void;
  forEach: (fn: (obj: T, i: number) => void) => void;
}
