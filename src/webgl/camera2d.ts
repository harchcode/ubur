import mat4 from './mat4';
import { Graphics } from './graphics';

export class Camera2D {
  readonly viewMatrix = mat4.create();
  readonly projectionMatrix = mat4.create();
  readonly vpMatrix = mat4.create();

  private g: Graphics;

  private x = 0;
  private y = 0;
  private w = 1;
  private h = 1;

  private screenW = 1;
  private screenH = 1;

  private ppwX = 0;
  private ppwY = 0;
  private wppX = 0;
  private wppY = 0;

  constructor(g: Graphics) {
    this.g = g;
    this.screenW = g.screenWidth();
    this.screenH = g.screenHeight();

    this.setPosition(0, 0);
  }

  setScreenSize(width: number, height: number) {
    this.screenW = width;
    this.screenH = height;

    this.calcPPW();
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
  getScreenX = (worldX: number): number =>
    (worldX - this.x) * this.ppwX + this.screenW * 0.5;
  getScreenY = (worldY: number): number =>
    this.screenH * 0.5 - (worldY - this.y) * this.ppwY;
  getOnScreenW = (w: number): number => this.ppwX * w;

  private calcVPMatrix = () => {
    mat4.multiply(this.vpMatrix, this.projectionMatrix, this.viewMatrix);
  };

  private calcPPW = () => {
    this.ppwX = this.screenW / this.w;
    this.ppwY = this.screenH / this.h;
    this.wppX = this.w / this.screenW;
    this.wppY = this.h / this.screenH;
  };
}
