import init, { Ubur } from "../pkg/ubur";
import {
  beginDraw,
  drawRect,
  initGraphics,
  resizeGraphicsIfNeeded,
  setCircle,
  setClearColor,
  setColor,
  setViewPos,
  setViewSize
} from "./graphics";
import vertexShaderSource from "./simple.vert";
import fragmentShaderSource from "./simple.frag";
import { GameLoop } from "./gameloop";

const worldCanvas = document.getElementById(
  "world-canvas"
) as HTMLCanvasElement;

let ubur: Ubur;

function update(dt: number) {
  ubur.update(dt);
}

function draw() {
  const worldSize = Ubur.world_size();
  const wsp2 = worldSize * 0.5;

  resizeGraphicsIfNeeded();
  beginDraw();

  setCircle(false);
  setColor(0);
  drawRect(-10, wsp2, 20, worldSize);
  drawRect(worldSize + 10, wsp2, 20, worldSize);
  drawRect(wsp2, -10, worldSize, 20);
  drawRect(wsp2, worldSize + 10, worldSize, 20);

  const len = ubur.get_sphere_count();

  for (let i = 0; i < len; i++) {
    const x = ubur.get_sphere_x(i);
    const y = ubur.get_sphere_y(i);
    const r = ubur.get_sphere_r(i);
    const color = ubur.get_sphere_color(i);
    const d = r * 2;

    if (i === 0) {
      setViewSize(250000 + r * 2000);
      setViewPos(x, y);
    }

    setCircle(true);
    setColor(color);
    drawRect(x, y, d, d);
  }
}

async function main() {
  await init();

  const gl = worldCanvas.getContext("webgl");

  if (!gl) {
    alert("WebGL is not supported! Go update your browser!");
    return;
  }

  if (!initGraphics(gl, vertexShaderSource, fragmentShaderSource)) {
    return;
  }

  setClearColor(0xffffff);

  const worldSize = Ubur.world_size();
  const wsp2 = worldSize * 0.5;

  setViewSize(200000);
  setViewPos(wsp2, wsp2);

  ubur = Ubur.new();
  ubur.init();

  const loop = new GameLoop(update, draw);
  loop.start();
}

main();
