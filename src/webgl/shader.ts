import { Graphics } from './graphics';

import vsc from './shaders/simple.vert';
import fsc from './shaders/simple.frag';
import { Color } from '../utils/color';
import mat4 from './mat4';
import { Camera2D } from './camera2d';

export class Shader {
  readonly graphics: Graphics;

  private vertexBuffer: WebGLBuffer;
  private program: WebGLProgram;
  private positionHandle = 0;
  private colorHandle: WebGLUniformLocation = 0;
  private transformHandle: WebGLUniformLocation = 0;
  private vpHandle: WebGLUniformLocation = 0;
  private circleHandle: WebGLUniformLocation = 0;
  private mat = mat4.create();

  constructor(graphics: Graphics) {
    this.graphics = graphics;

    this.vertexBuffer = this.initVertexBuffer();
    this.program = this.initProgram();
    this.initHandle();
  }

  public begin = (camera: Camera2D) => {
    const { gl } = this.graphics;

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.vpHandle, false, camera.vpMatrix);
    gl.enableVertexAttribArray(this.positionHandle);
  };

  public setColor = (color: Color) => {
    const { gl } = this.graphics;

    gl.uniform4fv(this.colorHandle, color);
  };

  public end = () => {
    const { gl } = this.graphics;

    gl.disableVertexAttribArray(this.positionHandle);
  };

  rect = (x: number, y: number, w: number, h: number) => {
    const { gl } = this.graphics;

    this.setCircle(false);

    mat4.identity(this.mat);
    mat4.translate(this.mat, x, y, 0);
    mat4.scale(this.mat, w, h, 0);

    gl.uniformMatrix4fv(this.transformHandle, false, this.mat);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  circle = (x: number, y: number, r: number) => {
    const { gl } = this.graphics;

    this.setCircle(true);

    mat4.identity(this.mat);
    mat4.translate(this.mat, x, y, 0);
    mat4.scale(this.mat, r * 2, r * 2, 0);

    gl.uniformMatrix4fv(this.transformHandle, false, this.mat);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  private setCircle = (isCircle: boolean) => {
    const { gl } = this.graphics;

    gl.uniform1i(this.circleHandle, isCircle ? 1 : 0);
  };

  private initVertexBuffer = () => {
    const { gl } = this.graphics;

    const squareVertices = [
      0.5,
      0.5,
      0.0,
      -0.5,
      0.5,
      0.0,
      0.5,
      -0.5,
      0.0,
      -0.5,
      -0.5,
      0.0
    ];
    const vertexBuffer = gl.createBuffer();

    if (!vertexBuffer) throw 'Failed to create buffer.';

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(squareVertices),
      gl.STATIC_DRAW
    );

    return vertexBuffer;
  };

  private initProgram = () => {
    return this.graphics.loadAndCompileShader(vsc, fsc);
  };

  private initHandle = () => {
    const { gl } = this.graphics;

    const positionHandle = gl.getAttribLocation(this.program, 'aPosition');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.vertexAttribPointer(
      positionHandle,
      3, // each vertex element is a 3-float (x,y,z)
      gl.FLOAT, // data type is FLOAT
      false, // if the content is normalized vectors
      0, // number of bytes to skip in between elements
      0 // offsets to the first element
    );

    this.positionHandle = positionHandle;

    try {
      this.colorHandle = this.getUniformLocation('uColor');
      this.transformHandle = this.getUniformLocation('uTransform');
      this.vpHandle = this.getUniformLocation('uVPTransform');
      this.circleHandle = this.getUniformLocation('uCircle');
    } catch (err) {
      throw err;
    }
  };

  private getUniformLocation(attr: string) {
    const res = this.graphics.gl.getUniformLocation(this.program, attr);

    if (!res) throw `Location ${attr} does not exist!`;

    return res;
  }
}
