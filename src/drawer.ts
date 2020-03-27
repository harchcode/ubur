import { DrawerInterface, GameInterface } from './types';
import { Graphics } from './webgl/graphics';
import { Shader } from './webgl/shader';
import { Camera2D } from './webgl/camera2d';
import {
  BACK_COLOR,
  WORLD_L,
  SPHERE_COLORS,
  ARENA_COLOR,
  GRID_COLOR,
  GRID_LINE_COUNT,
  GRID_LINE_W
} from './constants';

export class Drawer implements DrawerInterface {
  graphics: Graphics;
  shader: Shader;
  camera: Camera2D;
  game: GameInterface;

  constructor(game: GameInterface, canvas: HTMLCanvasElement) {
    this.game = game;
    this.graphics = new Graphics(canvas);
    this.shader = new Shader(this.graphics);
    this.camera = new Camera2D(this.graphics);

    this.graphics.setClearColor(BACK_COLOR);

    this.camera.setPosition(WORLD_L * 0.5, WORLD_L * 0.5);
  }

  draw = () => {
    this.graphics.clear();

    this.shader.begin(this.camera);

    this.drawArena();
    this.drawSpheres();

    this.shader.end();
  };

  private drawSpheres = () => {
    const { shader } = this;
    const { spheres } = this.game;

    spheres.forEach(sphere => {
      shader.setColor(SPHERE_COLORS[sphere.colorIndex]);
      shader.circle(sphere.x, sphere.y, sphere.r);
    });
  };

  private drawArena = () => {
    const { shader } = this;

    shader.setColor(ARENA_COLOR);
    shader.rect(WORLD_L * 0.5, WORLD_L * 0.5, WORLD_L, WORLD_L);

    shader.setColor(GRID_COLOR);

    const gapX = WORLD_L / GRID_LINE_COUNT;
    let i = gapX;

    while (i < WORLD_L) {
      shader.rect(i, WORLD_L * 0.5, GRID_LINE_W, WORLD_L);
      i += gapX;
    }

    const gapY = WORLD_L / GRID_LINE_COUNT;
    i = gapY;

    while (i < WORLD_L) {
      shader.rect(WORLD_L * 0.5, i, WORLD_L, GRID_LINE_W);
      i += gapY;
    }
  };

  resize = (w: number, h: number) => {
    this.graphics.setViewport(0, 0, w, h);

    const ratio = w / h;
    const pw = ratio >= 1 ? WORLD_L : ratio * WORLD_L;
    const ph = ratio <= 1 ? WORLD_L : WORLD_L / ratio;

    this.camera.setProjection(pw, ph);
  };
}
