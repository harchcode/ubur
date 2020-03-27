import mat4 from './mat4';
import { Graphics } from './graphics';

export class Camera2D {
  readonly viewMatrix = mat4.create();
  readonly projectionMatrix = mat4.create();
  readonly vpMatrix = mat4.create();

  private g: Graphics;

  private x = 0;
  private y = 0;
  private w = 0;
  private h = 0;

  private ppwX = 0;
  private ppwY = 0;
  private wppX = 0;
  private wppY = 0;

  constructor(g: Graphics) {
    this.g = g;

    this.setPosition(0, 0);
  }

  setProjection = (width: number, height: number) => {
    this.w = width;
    this.h = height;

    const w = width * 0.5;
    const h = height * 0.5;

    mat4.ortho(this.projectionMatrix, -w, w, -h, h, 3, 20);

    this.calcPPW();
    this.calcVPMatrix();
  };

  setPosition = (x: number, y: number) => {
    this.x = x;
    this.y = y;

    mat4.lookAt(this.viewMatrix, x, y, 10, x, y, 0, 0, 1, 0.0);

    this.calcVPMatrix();
  };

  getWorldX = (screenX: number): number => this.x + screenX * this.wppX;
  getWorldY = (screenY: number): number => this.y + screenY * this.wppY;
  getScreenX = (worldX: number): number => (worldX - this.x) * this.ppwX;
  getScreenY = (worldY: number): number => (worldY - this.y) * this.ppwY;

  private calcVPMatrix = () => {
    mat4.multiply(this.vpMatrix, this.projectionMatrix, this.viewMatrix);
  };

  private calcPPW = () => {
    this.ppwX = this.g.screenWidth() / this.w;
    this.ppwY = this.g.screenHeight() / this.h;
    this.wppX = this.w / this.g.screenWidth();
    this.wppY = this.h / this.g.screenHeight();
  };
}
