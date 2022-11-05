import init, { Ubur } from "../pkg/ubur";
import {
  beginDraw,
  drawName,
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
import { FAKE_PLAYER_NAMES } from "./utils";

const worldCanvas = document.getElementById(
  "world-canvas"
) as HTMLCanvasElement;
const nameCanvas = document.getElementById("name-canvas") as HTMLCanvasElement;
const titleUI = document.getElementById("title-ui") as HTMLCanvasElement;
const playButton = document.getElementById("play-button") as HTMLButtonElement;
const nameInput = document.getElementById("name-input") as HTMLInputElement;

let memory: WebAssembly.Memory;
let ubur: Ubur;
let playerId: number | undefined = undefined;
let playerUid: number | undefined = undefined;
let playerName = "";
let viewX: number;
let viewY: number;
let viewArea: number;

function update(dt: number) {
  ubur.update(dt);

  if (!playerId || !playerUid) return;

  viewX = ubur.get_sphere_x(playerId);
  viewY = ubur.get_sphere_y(playerId);
  viewArea = ubur.get_sphere_view_area(playerId);

  // check is player dead
  if (ubur.is_player_dead(playerId, playerUid)) {
    playerId = undefined;
    playerUid = undefined;

    titleUI.style.display = "flex";
  }
}

const BG_CELLS_PER_ROW = 5;
const BG_COLOR = 0xd8e3e7;
const CLEAR_COLOR = 0x51c4d3;
const GRID_LINE_COLOR = 0x126e82;
const WALL_COLOR = 0x132c33;
const GRID_LINE_WIDTH = 1;
const WALL_WIDTH = 4;
const WALL_HALF_WIDTH = WALL_WIDTH * 0.5;

function drawBackground() {
  const worldSize = Ubur.world_size();
  const bgCellSize = worldSize / BG_CELLS_PER_ROW;

  const ar = getAspectRatio();

  const h = Math.sqrt(viewArea / ar);
  const w = ar * h;

  setViewSize(viewArea);
  setViewPos(viewX, viewY);

  const left = viewX - w * 0.5;
  const right = viewX + w * 0.5;
  const top = viewY - h * 0.5;
  const bottom = viewY + h * 0.5;

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

  // draw wall
  setColor(WALL_COLOR);

  if (bl < GRID_LINE_WIDTH * 0.5) {
    drawRect(bl - WALL_HALF_WIDTH, by, WALL_WIDTH, bh + WALL_WIDTH * 2);
  }

  if (br > worldSize - GRID_LINE_WIDTH * 0.5) {
    drawRect(br + WALL_HALF_WIDTH, by, WALL_WIDTH, bh + WALL_WIDTH * 2);
  }

  if (bt < GRID_LINE_WIDTH * 0.5) {
    drawRect(bx, bt - WALL_HALF_WIDTH, bw, WALL_WIDTH);
  }

  if (bb > worldSize - GRID_LINE_WIDTH * 0.5) {
    drawRect(bx, bb + WALL_HALF_WIDTH, bw, WALL_WIDTH);
  }
}

function drawPlayer() {
  if (playerId === undefined) return;

  const x = viewX;
  const y = viewY;
  const r = ubur.get_sphere_r(playerId);
  const color = ubur.get_sphere_color(playerId);
  const d = r * 2;

  setCircle(true);
  setColor(color);
  drawRect(x, y, d, d);

  drawName(x, y, r, playerName);
}

function draw() {
  resizeGraphicsIfNeeded();

  beginDraw();

  drawBackground();

  const ar = getAspectRatio();
  const ptr = ubur.get_visible_sphere_ids(ar, viewX, viewY, viewArea);
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
    const name = ubur.get_sphere_name(ids[i]);

    if (name) {
      drawName(x, y, r, FAKE_PLAYER_NAMES[name]);
    }

    // console.log(name === undefined ? "" : FAKE_PLAYER_NAMES[name]);

    const d = r * 2;

    setCircle(true);
    setColor(color);
    drawRect(x, y, d, d);
  }

  drawPlayer();
}

function handleShoot(ev: MouseEvent) {
  if (!playerId) return;

  const cx = window.innerWidth * 0.5;
  const cy = window.innerHeight * 0.5;

  const x = ev.clientX - cx;
  const y = ev.clientY - cy;

  ubur.shoot(playerId, x, y);
}

const ow = 640;
const oh = 960;
const ar = ow / oh;

function resizeUI() {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  const war = ww / wh;

  const scale = ar > war ? ww / ow : wh / oh;

  titleUI.style.transform = `scale(${scale}, ${scale})`;
}

async function main() {
  resizeUI();

  window.addEventListener("resize", () => {
    resizeUI();
  });

  const wasm = await init();
  memory = wasm.memory;

  const gl = worldCanvas.getContext("webgl");

  if (!gl) {
    alert("WebGL is not supported! Go update your browser!");
    return;
  }

  const context = nameCanvas.getContext("2d");

  if (!context) {
    alert("Canvas is not supported! Go update your browser!");
    return;
  }

  if (!initGraphics(gl, vertexShaderSource, fragmentShaderSource, context)) {
    return;
  }

  setClearColor(CLEAR_COLOR);

  const worldSize = Ubur.world_size();
  const wsp2 = worldSize * 0.5;

  viewX = wsp2;
  viewY = wsp2;
  viewArea = 200000;

  setViewSize(viewArea);
  setViewPos(viewX, viewY);

  ubur = Ubur.new();
  ubur.init();

  titleUI.style.display = "flex";

  playButton.addEventListener("click", () => {
    titleUI.style.display = "none";

    playerName = nameInput.value || "Anon";
    const ptr = ubur.register_player(playerName);
    const r = new Uint32Array(memory.buffer, ptr, 2);

    playerId = r[0];
    playerUid = r[1];
  });

  window.addEventListener("mousedown", handleShoot);

  const loop = new GameLoop(update, draw);
  loop.start();
}

main();
