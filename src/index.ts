// import init from "../pkg/ubur";
import {
  beginDraw,
  drawRect,
  initGraphics,
  resizeGraphics,
  setColor
} from "./graphics";

// let memory: WebAssembly.Memory;

const worldCanvas = document.getElementById(
  "world-canvas"
) as HTMLCanvasElement;

const vertexShaderSource = (
  document.querySelector("#vertex-shader-2d") as HTMLScriptElement
).text;
const fragmentShaderSource = (
  document.querySelector("#fragment-shader-2d") as HTMLScriptElement
).text;

const x = 0;
const y = 0;

function draw() {
  resizeGraphics();
  beginDraw();

  // x = (x + 10) % worldCanvas.width;
  // y = (y + 2) % worldCanvas.height;
  setColor(new Float32Array([Math.random(), Math.random(), Math.random(), 1]));
  drawRect(x, y, 100, 30);

  requestAnimationFrame(draw);
}

async function main() {
  // const wasm = await init();
  // memory = wasm.memory;

  const gl = worldCanvas.getContext("webgl");

  if (!gl) {
    alert("WebGL is not supported! Go update your browser!");
    return;
  }

  initGraphics(gl, vertexShaderSource, fragmentShaderSource);

  draw();
}

main();
