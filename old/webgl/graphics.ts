import { Color } from '../utils/color';

export class Graphics {
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGLRenderingContext;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {}) as WebGLRenderingContext;
    this.gl.getExtension('OES_standard_derivatives');
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  screenWidth = () => window.innerWidth;
  screenHeight = () => window.innerHeight;
  canvasWidth = () => this.canvas.clientWidth;
  canvasHeight = () => this.canvas.clientHeight;

  clear = () => {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  };

  setClearColor = (color: Color) => {
    this.gl.clearColor(color[0], color[1], color[2], color[3]);
  };

  loadShader = (type: number, code: string): WebGLShader => {
    const { gl } = this;

    const shader = gl.createShader(type);

    if (!shader) throw 'Failed to create shader.';

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw 'A shader compiling error occurred: ' + gl.getShaderInfoLog(shader);
    }

    return shader;
  };

  compileShader = (
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram => {
    const { gl } = this;

    const program = gl.createProgram();

    if (!program) throw 'Failed to create shader program.';

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw 'Error linking shader';
    }

    return program;
  };

  loadAndCompileShader = (
    vertexShaderCode: string,
    fragmentShaderCode: string
  ): WebGLProgram => {
    const { gl } = this;

    const vs = this.loadShader(gl.VERTEX_SHADER, vertexShaderCode);
    const fs = this.loadShader(gl.FRAGMENT_SHADER, fragmentShaderCode);

    return this.compileShader(vs, fs);
  };

  setViewport = (x: number, y: number, w: number, h: number) => {
    const { gl } = this;

    gl.viewport(x, y, w, h);
  };
}
