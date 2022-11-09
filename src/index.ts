import init, { Ubur } from "../pkg/ubur";
import {
  beginDraw,
  drawHighscores,
  drawName,
  drawRect,
  drawScore,
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
const hsButton = document.getElementById("hs-button") as HTMLButtonElement;

let ubur: Ubur;
let playerId: number | undefined = undefined;
let playerUid: number | undefined = undefined;
let playerName = "";
let viewX: number;
let viewY: number;
let viewArea: number;
let showHighscore = false;

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

const BG_CELLS_PER_ROW = 10;
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

const hsScores: number[] = [];
const hsNames: string[] = [];
const emptyName = "-";

function draw() {
  resizeGraphicsIfNeeded();

  setViewSize(viewArea);
  setViewPos(viewX, viewY);

  beginDraw();

  drawBackground();

  const ar = getAspectRatio();
  const ids = ubur.get_visible_sphere_ids(ar, viewX, viewY, viewArea);
  const len = ids.length;

  for (let i = 0; i < len; i++) {
    if (ids[i] === playerId) {
      continue;
    }

    const x = ubur.get_sphere_x(ids[i]);
    const y = ubur.get_sphere_y(ids[i]);
    const r = ubur.get_sphere_r(ids[i]);
    const color = ubur.get_sphere_color(ids[i]);
    const name = ubur.get_sphere_name(ids[i]);

    if (name != undefined) {
      drawName(x, y, r, FAKE_PLAYER_NAMES[name]);
    }

    const d = r * 2;

    setCircle(true);
    setColor(color);
    drawRect(x, y, d, d);
  }

  drawPlayer();

  // draw scores
  const playerScore = playerId ? ubur.get_sphere_score(playerId) : 0;

  if (playerId !== undefined) {
    drawScore(playerScore);
  }

  if (!showHighscore) return;

  const hsids = ubur.get_top_5_player_ids();
  const hslen = hsids.length;

  for (let i = 0; i < hslen; i++) {
    const id = hsids[i];

    hsScores[i] = ubur.get_sphere_score(id);

    if (id === playerId) {
      hsNames[i] = playerName;
    } else {
      const nameIndex = ubur.get_sphere_name(id);

      hsNames[i] =
        nameIndex === undefined ? emptyName : FAKE_PLAYER_NAMES[nameIndex];
    }
  }

  for (let i = hslen; i < 5; i++) {
    hsScores[i] = 0;
    hsNames[i] = emptyName;
  }

  const playerRank = playerId ? ubur.get_sphere_rank(playerId) : 0;

  drawHighscores(hsNames, hsScores, playerName, playerRank, playerScore);
}

function handleShoot(ev: MouseEvent) {
  if (!playerId) return;

  const cx = window.innerWidth * 0.5;
  const cy = window.innerHeight * 0.5;

  const x = ev.clientX - cx;
  const y = ev.clientY - cy;

  ubur.shoot(playerId, x, y);
}

function resizeUI() {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  const war = ww / wh;

  const ow = titleUI.clientWidth;
  const oh = titleUI.clientHeight;
  const ar = ow / oh;

  const scale = ar > war ? ww / ow : wh / oh;

  titleUI.style.transform = `scale(${scale}, ${scale})`;
}

async function main() {
  resizeUI();

  window.addEventListener("resize", () => {
    resizeUI();
  });

  await init();

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

  nameInput.value = localStorage.getItem("player-name") || "";

  playButton.addEventListener("click", e => {
    titleUI.style.display = "none";
    localStorage.setItem("player-name", nameInput.value);

    playerName = nameInput.value || "Anon";
    const r = ubur.register_player(playerName);

    playerId = r[0];
    playerUid = r[1];

    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
  });

  window.addEventListener("click", handleShoot);

  hsButton.addEventListener("click", e => {
    showHighscore = !showHighscore;

    if (!playerId) {
      titleUI.style.display = showHighscore ? "none" : "flex";
    }

    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
  });

  const loop = new GameLoop(update, draw);
  loop.start();
}

main();
