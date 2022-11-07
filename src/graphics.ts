/**
 * Handles rendering with WebGL
 * We use rect's center as coordinate instead of top left.
 */

import { mat3, vec2 } from "gl-matrix";
import { setColorArr } from "./utils";

let gl: WebGLRenderingContext;
let ctx: CanvasRenderingContext2D;

// We only need 1 shader program
let program: WebGLProgram;

let positionBuffer: WebGLBuffer | null = null;
let positionLocation = 0;

const colorArr = new Float32Array(4);

let colorLocation: WebGLUniformLocation | null = null;
let circleLocation: WebGLUniformLocation | null = null;
let transformLocation: WebGLUniformLocation | null = null;
let projectionLocation: WebGLUniformLocation | null = null;

const translationVec = vec2.create();
const scaleVec = vec2.create();
const transformMatrix = mat3.create();

const rectPoints = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5
]);

let viewArea = 10;
let viewX = 0;
let viewY = 0;
const vpMatrix = mat3.create();
const projectionMatrix = mat3.create();
const viewMatrix = mat3.create();
const viewTranslationVec = vec2.create();
const viewScaleVec = vec2.create();

function calcVPMatrix() {
  mat3.identity(viewMatrix);
  mat3.scale(viewMatrix, viewMatrix, viewScaleVec);
  mat3.translate(viewMatrix, viewMatrix, viewTranslationVec);
  mat3.multiply(vpMatrix, projectionMatrix, viewMatrix);
}

export function setViewSize(area: number) {
  viewArea = area;
  const canvas = gl.canvas;

  const scale = Math.sqrt((canvas.width * canvas.height) / area);
  vec2.set(viewScaleVec, scale, scale);
}

export function getViewWidth() {
  return gl.canvas.width * viewScaleVec[0];
}

export function getViewHeight() {
  return gl.canvas.height * viewScaleVec[1];
}

export function setViewPos(x: number, y: number) {
  viewX = x;
  viewY = y;

  vec2.set(viewTranslationVec, -x, -y);
  viewTranslationVec[0] += (gl.canvas.width * 0.5) / viewScaleVec[0];
  viewTranslationVec[1] += (gl.canvas.height * 0.5) / viewScaleVec[1];
}

export function getAspectRatio() {
  return gl.canvas.width / gl.canvas.height;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return undefined;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);

  return undefined;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  if (!program) return undefined;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);

  return undefined;
}

export function setClearColor(color: number) {
  setColorArr(colorArr, color);

  gl.clearColor(colorArr[0], colorArr[1], colorArr[2], colorArr[3]);
}

function initGL(
  glContext: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) {
  gl = glContext;

  gl.getExtension("OES_standard_derivatives");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (!vertexShader || !fragmentShader) return false;

  const _program = createProgram(gl, vertexShader, fragmentShader);
  if (!_program) {
    alert("Failed to load shader program.");
    return false;
  } else {
    program = _program;
  }

  positionLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  colorLocation = gl.getUniformLocation(program, "u_color");
  circleLocation = gl.getUniformLocation(program, "u_circle");
  transformLocation = gl.getUniformLocation(program, "u_transform");
  projectionLocation = gl.getUniformLocation(program, "u_projection");

  // Create a buffer to put three 2d clip space points in
  positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  setViewPos(0, 0);

  return true;
}

function initNameCanvas(nameContext: CanvasRenderingContext2D) {
  ctx = nameContext;

  return true;
}

export function initGraphics(
  glContext: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  nameContext: CanvasRenderingContext2D
) {
  if (!initGL(glContext, vertexShaderSource, fragmentShaderSource)) {
    return false;
  }

  initNameCanvas(nameContext);

  resizeGraphics();

  return true;
}

export function resizeGraphics() {
  const canvas = gl.canvas;
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  canvas.width = displayWidth;
  canvas.height = displayHeight;

  gl.viewport(0, 0, canvas.width, canvas.height);

  mat3.identity(projectionMatrix);
  mat3.projection(projectionMatrix, canvas.width, canvas.height);
  setViewSize(viewArea);
  setViewPos(viewX, viewY);

  const nameCanvas = ctx.canvas;
  nameCanvas.width = displayWidth;
  nameCanvas.height = displayHeight;
}

export function resizeGraphicsIfNeeded() {
  const canvas = gl.canvas;
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    resizeGraphics();
  }

  return needResize;
}

const textAlign = "center";
const textBaseline = "middle";
const font = "16px sans-serif";
const textColor = "#000";
const textOutlineColor = "#fff";
const lineWidth = 2;

export function beginDraw() {
  // set text align and baseline
  // somehow it got reset back when the canvas got resized.
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = font;
  ctx.strokeStyle = textOutlineColor;
  ctx.fillStyle = textColor;
  ctx.lineWidth = lineWidth;

  // Clear name canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Clear the canvas.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2; // 2 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, 0);

  calcVPMatrix();
}

export function setColor(rgb: number) {
  setColorArr(colorArr, rgb);

  gl.uniform4fv(colorLocation, colorArr);
}

export function drawRect(x: number, y: number, width: number, height: number) {
  gl.bufferData(gl.ARRAY_BUFFER, rectPoints, gl.STATIC_DRAW);

  vec2.set(translationVec, x, y);
  vec2.set(scaleVec, width, height);

  mat3.identity(transformMatrix);
  mat3.translate(transformMatrix, transformMatrix, translationVec);
  mat3.scale(transformMatrix, transformMatrix, scaleVec);

  // set transform
  gl.uniformMatrix3fv(projectionLocation, false, vpMatrix);
  gl.uniformMatrix3fv(transformLocation, false, transformMatrix);

  // Draw the rectangle.
  const primitiveType = gl.TRIANGLE_STRIP;
  const count = 4;
  gl.drawArrays(primitiveType, 0, count);
}

export function setCircle(isCircle: boolean) {
  gl.uniform1i(circleLocation, isCircle ? 1 : 0);
}

export function drawName(x: number, y: number, r: number, name: string) {
  const _r = Math.max(r, 10.0);
  const textScale = (_r / 25) * viewScaleVec[0];
  const oneOverTextScale = 1 / textScale;
  ctx.setTransform(textScale, 0, 0, textScale, 0, 0);
  // ctx.scale(textScale, textScale);
  const ax =
    ((x - viewX) * viewScaleVec[0] + ctx.canvas.width * 0.5) * oneOverTextScale;
  const ay =
    ((y - viewY) * viewScaleVec[1] + ctx.canvas.height * 0.5) *
    oneOverTextScale;
  ctx.strokeText(name, ax, ay);
  ctx.fillText(name, ax, ay);
  // ctx.scale(oneOverTextScale, oneOverTextScale);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

const scoreTextAlign = "left";
const scoreBaseline = "bottom";
const scoreText = "Score: ";
const scoreScale = 2.0;
const scoreOneOverScale = 1 / scoreScale;

export function drawScore(score: number) {
  const s = score.toString();

  const sx = 16 * scoreOneOverScale;
  const zx = sx + 56;
  const y = (ctx.canvas.height - 8) * scoreOneOverScale;

  ctx.setTransform(scoreScale, 0, 0, scoreScale, 0, 0);

  ctx.textAlign = scoreTextAlign;
  ctx.textBaseline = scoreBaseline;

  ctx.strokeText(scoreText, sx, y);
  ctx.fillText(scoreText, sx, y);

  ctx.strokeText(s, zx, y);
  ctx.fillText(s, zx, y);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

const hsScoreTextAlign = "right";
const hsRankTextAlign = "left";
const hsBaseline = "bottom";
const hsScales = [1.4, 1.2, 1.2, 1.0, 1.0, 1.0];
const hsNameOffset = 256;
const hsRankOffset = hsNameOffset + 40;
const hsLineHeight = 24;
const hsColors = ["#dc2626", "#2563eb", "#ca8a04", "black", "black", "black"];
const hsLineColors = ["white", "white", "white", "white", "white", "white"];
const top3Font = "bold 16px sans-serif";
const hsHighlightColor = "#0002";

export function drawHighscores(
  names: string[],
  highScores: number[],
  playerName: string,
  playerRank: number,
  playerScore: number
) {
  ctx.textBaseline = hsBaseline;

  let ay = 0;

  for (let i = 0; i < 6; i++) {
    if (i === 5 && playerRank <= 5) break;

    const rank = i === 5 ? playerRank.toString() : (i + 1).toString();
    const score = i === 5 ? playerScore.toString() : highScores[i].toString();
    const name = i === 5 ? playerName : names[i];

    const scale = hsScales[i];
    const oneOverScale = 1 / scale;

    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const x = (ctx.canvas.width - 16) * oneOverScale;
    ay += hsLineHeight * scale;
    const y = (ay + 48) * oneOverScale;
    // const y = (i * 24 + 48) * oneOverScale;

    if (playerRank - 1 === i || i === 5) {
      ctx.fillStyle = hsHighlightColor;

      ctx.fillRect(
        x - (hsRankOffset + 8) * oneOverScale,
        y - 20,
        312 * oneOverScale,
        24
      );
    }

    ctx.font = i < 3 ? top3Font : font;
    ctx.fillStyle = hsColors[i];
    ctx.strokeStyle = hsLineColors[i];
    ctx.lineWidth = 2 * scale;

    ctx.textAlign = hsRankTextAlign;
    ctx.strokeText(rank, x - hsRankOffset * oneOverScale, y);
    ctx.fillText(rank, x - hsRankOffset * oneOverScale, y);

    // ctx.fillRect(x - hsNameOffset * oneOverScale, y, 160 * oneOverScale, 24);
    ctx.strokeText(
      name,
      x - hsNameOffset * oneOverScale,
      y,
      160 * oneOverScale
    );
    ctx.fillText(name, x - hsNameOffset * oneOverScale, y, 160 * oneOverScale);

    ctx.textAlign = hsScoreTextAlign;
    ctx.strokeText(score, x, y);
    ctx.fillText(score, x, y);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
