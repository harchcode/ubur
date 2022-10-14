import { DrawerInterface, GameInterface, Sphere, SphereType } from "./types";
import { Graphics } from "./webgl/graphics";
import { Shader } from "./webgl/shader";
import { Camera2D } from "./webgl/camera2d";
import {
  BACK_COLOR,
  WORLD_L,
  PLAYER_COLORS,
  ARENA_COLOR,
  ARENA_GRID_COLOR,
  ARENA_GRID_LINE_W,
  ARENA_GRID_CELL_L,
  ARENA_GRID_LINE_COUNT,
  CAMERA_ZOOM_SPEED,
  PLAYER_NAME_COLORS,
  AM_COLOR,
  FOOD_COLORS,
  BULLET_COLORS
} from "./constants";

const OOAGCL = 1 / ARENA_GRID_CELL_L;
export class Drawer implements DrawerInterface {
  playerSphere?: Sphere;

  private graphics: Graphics;
  private shader: Shader;
  private camera: Camera2D;
  private game: GameInterface;
  private maxVW = 0;
  private maxVH = 0;
  private vl = 100;
  private currentVL = 100;
  private lastPlayerX = WORLD_L * 0.5;
  private lastPlayerY = WORLD_L * 0.5;
  private nameCtx: CanvasRenderingContext2D;
  private nameCanvas: HTMLCanvasElement;
  private nameSizes: string[] = [];
  private nameSizeRLimit = 0;
  private nameSizeStep = 0;

  constructor(
    game: GameInterface,
    canvas: HTMLCanvasElement,
    nameCanvas: HTMLCanvasElement
  ) {
    this.game = game;
    this.graphics = new Graphics(canvas);
    this.shader = new Shader(this.graphics);
    this.camera = new Camera2D(this.graphics);

    this.nameCanvas = nameCanvas;
    this.nameCtx = this.initNameCtx();

    this.graphics.setClearColor(BACK_COLOR);

    this.camera.setScreenSize(this.nameCanvas.width, this.nameCanvas.height);
    this.camera.setPosition(this.lastPlayerX, this.lastPlayerY);
  }

  setPlayerSphere(sphere?: Sphere) {
    if (!sphere && this.playerSphere) {
      this.lastPlayerX = this.playerSphere.x;
      this.lastPlayerY = this.playerSphere.y;
    }

    this.playerSphere = sphere;
  }

  update = (dt: number) => {
    const { playerSphere } = this;

    if (playerSphere) {
      this.vl = (playerSphere.r + 50) * 2;
    }

    if (this.currentVL > this.vl) {
      this.currentVL = Math.max(
        this.currentVL - CAMERA_ZOOM_SPEED * dt,
        this.vl
      );
    } else if (this.currentVL < this.vl) {
      this.currentVL = Math.min(
        this.currentVL + CAMERA_ZOOM_SPEED * dt,
        this.vl
      );
    }
  };

  draw = () => {
    const { playerSphere } = this;

    this.graphics.clear();
    this.nameCtx.clearRect(0, 0, this.nameCanvas.width, this.nameCanvas.height);

    if (playerSphere) {
      this.camera.setPosition(playerSphere.x, playerSphere.y);
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

  private getNameSize = (r: number): string => {
    for (
      let i = this.nameSizeStep, j = 0;
      i < this.nameSizeRLimit;
      i += this.nameSizeStep, j++
    ) {
      if (r < i) return this.nameSizes[j];
    }

    return this.nameSizes[this.nameSizes.length - 1];
  };

  private drawSphere = (sphere: Sphere) => {
    const { playerSphere, lastPlayerX, lastPlayerY } = this;
    const { currentVL } = this;

    const x = playerSphere?.x || lastPlayerX;
    const y = playerSphere?.y || lastPlayerY;

    if (
      sphere.x - sphere.r > x + currentVL ||
      sphere.x + sphere.r < x - currentVL ||
      sphere.y - sphere.r > y + currentVL ||
      sphere.y + sphere.r < y - currentVL
    )
      return;

    if (sphere.type === SphereType.PLAYER) {
      this.drawPlayer(sphere);
    } else if (sphere.type === SphereType.AM) {
      this.drawAM(sphere);
    } else if (sphere.type === SphereType.FOOD) {
      this.drawFood(sphere);
    } else if (sphere.type === SphereType.BULLET) {
      this.drawBullet(sphere);
    }
  };

  private drawFood = (sphere: Sphere) => {
    this.shader.setColor(FOOD_COLORS[sphere.colorIndex]);
    this.shader.circle(sphere.x, sphere.y, sphere.r);
  };

  private drawBullet = (sphere: Sphere) => {
    this.shader.setColor(BULLET_COLORS[sphere.colorIndex]);
    this.shader.circle(sphere.x, sphere.y, sphere.r);
  };

  private drawAM = (sphere: Sphere) => {
    this.shader.setColor(AM_COLOR);
    this.shader.circle(sphere.x, sphere.y, sphere.r);
  };

  private drawPlayer = (sphere: Sphere) => {
    this.shader.setColor(PLAYER_COLORS[sphere.colorIndex]);
    this.shader.circle(sphere.x, sphere.y, sphere.r);

    const screenR = this.camera.getOnScreenW(sphere.r);

    const nameSize = this.getNameSize(screenR);

    this.nameCtx.fillStyle = PLAYER_NAME_COLORS[sphere.colorIndex];
    this.nameCtx.font = nameSize;
    this.nameCtx.fillText(
      sphere.name,
      this.camera.getScreenX(sphere.x),
      this.camera.getScreenY(sphere.y)
    );
  };

  private drawSpheres = () => {
    this.game.spheres.forEach(this.drawSphere);
    this.game.players.forEach(this.drawSphere);
  };

  private drawArena = () => {
    const { playerSphere, lastPlayerX, lastPlayerY } = this;
    const { shader, currentVL } = this;

    const x = playerSphere?.x || lastPlayerX;
    const y = playerSphere?.y || lastPlayerY;

    shader.setColor(ARENA_COLOR);
    shader.rect(WORLD_L * 0.5, WORLD_L * 0.5, WORLD_L, WORLD_L);

    const playerRight = x + currentVL;
    const playerLeft = x - currentVL;
    const playerTop = y + currentVL;
    const playerBottom = y - currentVL;

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

    this.nameCanvas.width = w;
    this.nameCanvas.height = h;

    this.initNameCtx();

    this.camera.setScreenSize(this.nameCanvas.width, this.nameCanvas.height);
    this.camera.setProjection(this.maxVW, this.maxVH);
  };

  private initNameCtx() {
    this.nameCtx = this.nameCanvas.getContext("2d") as CanvasRenderingContext2D;
    this.nameCtx.textAlign = "center";
    this.nameCtx.textBaseline = "middle";

    const nameCanvasL =
      this.nameCanvas.width > this.nameCanvas.height
        ? this.nameCanvas.width
        : this.nameCanvas.height;

    this.nameSizes = [
      `${nameCanvasL / 80}px sans-serif`,
      `${nameCanvasL / 60}px sans-serif`,
      `${nameCanvasL / 40}px sans-serif`,
      `${nameCanvasL / 30}px sans-serif`,
      `${nameCanvasL / 20}px sans-serif`,
      `bold ${nameCanvasL / 15}px sans-serif`,
      `bold ${nameCanvasL / 12}px sans-serif`,
      `bold ${nameCanvasL / 10}px sans-serif`
    ];

    this.nameSizeRLimit = nameCanvasL / 4;
    this.nameSizeStep = this.nameSizeRLimit / this.nameSizes.length;

    return this.nameCtx;
  }
}
