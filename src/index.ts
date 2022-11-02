import init, { Ubur } from "../pkg/ubur";
import {
  beginDraw,
  drawRect,
  getAspectRatio,
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

let memory: WebAssembly.Memory;
let ubur: Ubur;
let playerId = -1;

function update(dt: number) {
  ubur.update(dt);
}

const BG_CELLS_PER_ROW = 5;
const BG_COLOR = 0xd8e3e7;
const CLEAR_COLOR = 0x51c4d3;
const GRID_LINE_COLOR = 0x126e82;
const WALL_COLOR = 0x132c33;
const GRID_LINE_WIDTH = 2;
const WALL_WIDTH = 4;
const WALL_HALF_WIDTH = WALL_WIDTH * 0.5;

function drawPlayerAndBackground() {
  const worldSize = Ubur.world_size();
  const bgCellSize = worldSize / BG_CELLS_PER_ROW;

  const x = ubur.get_sphere_x(playerId);
  const y = ubur.get_sphere_y(playerId);
  const r = ubur.get_sphere_r(playerId);
  const color = ubur.get_sphere_color(playerId);
  const d = r * 2;
  const area = ubur.get_sphere_view_area(playerId);
  const ar = getAspectRatio();

  const h = Math.sqrt(area / ar);
  const w = ar * h;

  setViewSize(area);
  setViewPos(x, y);

  const left = x - w * 0.5;
  const right = x + w * 0.5;
  const top = y - h * 0.5;
  const bottom = y + h * 0.5;

  const bl = Math.max(left, 0);
  const br = Math.min(right, worldSize);
  const bt = Math.max(top, 0);
  const bb = Math.min(bottom, worldSize);
  const bx = (br + bl) / 2;
  const by = (bb + bt) / 2;
  const bw = br - bl;
  const bh = bb - bt;

  setCircle(false);
  setColor(BG_COLOR);

  drawRect(bx, by, bw, bh);

  // draw wall
  setColor(WALL_COLOR);

  if (bl < GRID_LINE_WIDTH * 0.5) {
    drawRect(
      bl - WALL_HALF_WIDTH + GRID_LINE_WIDTH,
      by,
      WALL_WIDTH,
      bh + (WALL_WIDTH - GRID_LINE_WIDTH) * 2
    );
  }

  if (br > worldSize - GRID_LINE_WIDTH * 0.5) {
    drawRect(
      br + WALL_HALF_WIDTH - GRID_LINE_WIDTH,
      by,
      WALL_WIDTH,
      bh + (WALL_WIDTH - GRID_LINE_WIDTH) * 2
    );
  }

  if (bt < GRID_LINE_WIDTH * 0.5) {
    drawRect(bx, bt - WALL_HALF_WIDTH + GRID_LINE_WIDTH, bw, WALL_WIDTH);
  }

  if (bb > worldSize - GRID_LINE_WIDTH * 0.5) {
    drawRect(bx, bb + WALL_HALF_WIDTH - GRID_LINE_WIDTH, bw, WALL_WIDTH);
  }

  // draw grid
  setColor(GRID_LINE_COLOR);

  for (let i = bl - (bl % bgCellSize) + bgCellSize; i < br; i += bgCellSize) {
    const gx =
      i === bl
        ? i - WALL_HALF_WIDTH + GRID_LINE_WIDTH
        : i === br
        ? i + WALL_HALF_WIDTH - GRID_LINE_WIDTH
        : i;
    const gw = i === bl || i === br ? WALL_WIDTH : GRID_LINE_WIDTH;
    const gh =
      i === bl || i === br ? bh + (WALL_WIDTH - GRID_LINE_WIDTH) * 2 : bh;

    drawRect(gx, by, gw, gh);
  }

  for (let i = bt - (bt % bgCellSize) + bgCellSize; i < bb; i += bgCellSize) {
    const gy =
      i === bt
        ? i - WALL_HALF_WIDTH + GRID_LINE_WIDTH
        : i === bb
        ? i + WALL_HALF_WIDTH - GRID_LINE_WIDTH
        : i;
    const gh = i === bt || i === bb ? WALL_WIDTH : GRID_LINE_WIDTH;

    drawRect(bx, gy, bw, gh);
  }

  setCircle(true);
  setColor(color);
  drawRect(x, y, d, d);
}

function draw() {
  resizeGraphicsIfNeeded();
  beginDraw();

  drawPlayerAndBackground();

  const ar = getAspectRatio();
  const ptr = ubur.get_visible_sphere_ids(playerId, ar);
  const len = new Uint32Array(memory.buffer, ptr, 1)[0];
  const ids = new Uint32Array(memory.buffer, ptr + 4, len);

  for (let i = 0; i < len; i++) {
    if (ids[i] === playerId) {
      continue;
    }

    const x = ubur.get_sphere_x(ids[i]);
    const y = ubur.get_sphere_y(ids[i]);
    const r = ubur.get_sphere_r(ids[i]);
    const color = ubur.get_sphere_color(ids[i]);
    const d = r * 2;

    setCircle(true);
    setColor(color);
    drawRect(x, y, d, d);
  }
}

function onClick(ev: MouseEvent) {
  if (!playerId) return;

  const cx = window.innerWidth * 0.5;
  const cy = window.innerHeight * 0.5;

  const x = ev.clientX - cx;
  const y = ev.clientY - cy;

  ubur.shoot(playerId, x, y);
}

async function main() {
  const wasm = await init();
  memory = wasm.memory;

  const gl = worldCanvas.getContext("webgl");

  if (!gl) {
    alert("WebGL is not supported! Go update your browser!");
    return;
  }

  if (!initGraphics(gl, vertexShaderSource, fragmentShaderSource)) {
    return;
  }

  setClearColor(CLEAR_COLOR);

  const worldSize = Ubur.world_size();
  const wsp2 = worldSize * 0.5;

  setViewSize(200000);
  setViewPos(wsp2, wsp2);

  ubur = Ubur.new();
  ubur.init();

  playerId = ubur.register_player();

  window.addEventListener("mousedown", onClick);

  const loop = new GameLoop(update, draw);
  loop.start();
}

main();
