import { mat3, vec2 } from "gl-matrix";
import { createProgram, createShader } from "./utils";

let gl: WebGLRenderingContext;

// We only need 1 shader program
let program: WebGLProgram;

let positionBuffer: WebGLBuffer | null = null;
let positionLocation = 0;

let resolutionLocation: WebGLUniformLocation | null = null;
let colorLocation: WebGLUniformLocation | null = null;
let transformLocation: WebGLUniformLocation | null = null;
let projectionLocation: WebGLUniformLocation | null = null;

const translationVec = vec2.create();
const scaleVec = vec2.create();
const transformMatrix = mat3.create();

const rectPoints = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

const projectionMatrix = mat3.create();
const cameraTranslationVec = vec2.create();

export function initGraphics(
  glContext: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) {
  gl = glContext;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (!vertexShader || !fragmentShader) return;

  const _program = createProgram(gl, vertexShader, fragmentShader);
  if (!_program) {
    alert("Failed to load shader program.");
    return;
  } else {
    program = _program;
  }

  gl.clearColor(0, 0, 0, 1);

  positionLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  colorLocation = gl.getUniformLocation(program, "u_color");
  transformLocation = gl.getUniformLocation(program, "u_transform");
  projectionLocation = gl.getUniformLocation(program, "u_projection");

  // Create a buffer to put three 2d clip space points in
  positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  mat3.identity(projectionMatrix);
  mat3.projection(projectionMatrix, gl.canvas.width, gl.canvas.height);

  resizeGraphics();
}

export function resizeGraphics() {
  const canvas = gl.canvas;
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);

    mat3.identity(projectionMatrix);
    mat3.projection(projectionMatrix, canvas.width, canvas.height);
  }

  return needResize;
}

export function beginDraw() {
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

  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
}

export function setColor(color: Float32Array) {
  // set the color
  gl.uniform4fv(colorLocation, color);
}

export function drawRect(x: number, y: number, width: number, height: number) {
  gl.bufferData(gl.ARRAY_BUFFER, rectPoints, gl.STATIC_DRAW);

  vec2.set(translationVec, x, y);
  vec2.set(scaleVec, width, height);

  mat3.identity(transformMatrix);
  mat3.translate(transformMatrix, transformMatrix, translationVec);
  mat3.scale(transformMatrix, transformMatrix, scaleVec);

  vec2.set(cameraTranslationVec, 1, 1);
  mat3.translate(projectionMatrix, projectionMatrix, cameraTranslationVec);

  // set transform
  gl.uniformMatrix3fv(projectionLocation, false, projectionMatrix);
  gl.uniformMatrix3fv(transformLocation, false, transformMatrix);

  // Draw the rectangle.
  const primitiveType = gl.TRIANGLE_STRIP;
  const count = 4;
  gl.drawArrays(primitiveType, 0, count);
}
