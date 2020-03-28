import { DrawerInterface, GameInterface, Sphere } from './types';
import { Graphics } from './webgl/graphics';
import { Shader } from './webgl/shader';
import { Camera2D } from './webgl/camera2d';
import {
  BACK_COLOR,
  WORLD_L,
  SPHERE_COLORS,
  ARENA_COLOR,
  ARENA_GRID_COLOR,
  ARENA_GRID_LINE_W,
  ARENA_GRID_CELL_L,
  ARENA_GRID_LINE_COUNT
} from './constants';

const OOAGCL = 1 / ARENA_GRID_CELL_L;
export class Drawer implements DrawerInterface {
  graphics: Graphics;
  shader: Shader;
  camera: Camera2D;
  game: GameInterface;
  playerSphere: Sphere;
  maxVW = 0;
  maxVH = 0;
  expanding = false;
  vl = 0;
  currentVL = 250;

  constructor(game: GameInterface, canvas: HTMLCanvasElement) {
    this.game = game;
    this.graphics = new Graphics(canvas);
    this.shader = new Shader(this.graphics);
    this.camera = new Camera2D(this.graphics);

    this.graphics.setClearColor(BACK_COLOR);

    this.playerSphere = this.game.spheres.get(1);
    this.camera.setPosition(this.playerSphere.x, this.playerSphere.y);
  }

  draw = () => {
    const { playerSphere } = this;
    this.graphics.clear();

    this.camera.setPosition(playerSphere.x, playerSphere.y);

    this.vl = (playerSphere.r + 50) * 2;

    if (this.currentVL > this.vl) {
      this.currentVL = Math.max(this.currentVL - 1, this.vl);
    } else if (this.currentVL < this.vl) {
      this.currentVL = Math.min(this.currentVL + 1, this.vl);
    }

    const ratio = (this.currentVL * 2) / WORLD_L;
    const vw = ratio * this.maxVW;
    const vh = ratio * this.maxVH;

    this.camera.setProjection(vw, vh);
    this.shader.begin(this.camera);

    this.drawArena();
    this.drawSpheres();

    this.shader.end();
  };

  private drawSphere = (sphere: Sphere) => {
    const { playerSphere, currentVL } = this;

    if (
      sphere.x - sphere.r > playerSphere.x + currentVL ||
      sphere.x + sphere.r < playerSphere.x - currentVL ||
      sphere.y - sphere.r > playerSphere.y + currentVL ||
      sphere.y + sphere.r < playerSphere.y - currentVL
    )
      return;

    this.shader.setColor(SPHERE_COLORS[sphere.colorIndex]);
    this.shader.circle(sphere.x, sphere.y, sphere.r);
  };

  private drawSpheres = () => {
    this.game.spheres.forEach(this.drawSphere);
  };

  private drawArena = () => {
    const { shader, playerSphere, currentVL } = this;

    shader.setColor(ARENA_COLOR);
    shader.rect(WORLD_L * 0.5, WORLD_L * 0.5, WORLD_L, WORLD_L);

    const playerRight = playerSphere.x + currentVL;
    const playerLeft = playerSphere.x - currentVL;
    const playerTop = playerSphere.y + currentVL;
    const playerBottom = playerSphere.y - currentVL;

    const startXIndex = Math.max(0, Math.floor(playerLeft * OOAGCL) - 1);
    const endXIndex = Math.min(
      ARENA_GRID_LINE_COUNT - 1,
      Math.floor(playerRight * OOAGCL) - 1
    );
    const startYIndex = Math.max(0, Math.floor(playerBottom * OOAGCL) - 1);
    const endYIndex = Math.min(
      ARENA_GRID_LINE_COUNT - 1,
      Math.floor(playerTop * OOAGCL) - 1
    );

    shader.setColor(ARENA_GRID_COLOR);

    for (let i = startXIndex; i <= endXIndex; i++) {
      shader.rect(
        (i + 1) * ARENA_GRID_CELL_L,
        WORLD_L * 0.5,
        ARENA_GRID_LINE_W,
        WORLD_L
      );
    }

    for (let i = startYIndex; i <= endYIndex; i++) {
      shader.rect(
        WORLD_L * 0.5,
        (i + 1) * ARENA_GRID_CELL_L,
        WORLD_L,
        ARENA_GRID_LINE_W
      );
    }
  };

  resize = (w: number, h: number) => {
    this.graphics.setViewport(0, 0, w, h);

    const ratio = w / h;
    this.maxVW = ratio >= 1 ? WORLD_L : ratio * WORLD_L;
    this.maxVH = ratio <= 1 ? WORLD_L : WORLD_L / ratio;

    this.camera.setProjection(this.maxVW, this.maxVH);
  };
}
