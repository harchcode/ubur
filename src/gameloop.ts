const FPS = 60;
const MPF = 1000 / FPS;
const SPF = MPF * 0.001;
const MAX_FRAMES_PER_UPDATE = 1;

export class GameLoop {
  private startTime = 0;
  private lastTime = 0;

  private counter = 0;
  private updateFn: (dt: number) => void;
  private drawFn?: () => void;

  constructor(updater: (dt: number) => void, drawer?: () => void) {
    this.updateFn = updater;
    this.drawFn = drawer;
  }

  start = () => {
    requestAnimationFrame(timestamp => {
      this.startTime = timestamp;
      this.lastTime = this.startTime;

      requestAnimationFrame(this.run);
    });
  };

  private run = (timestamp: number) => {
    const current = timestamp;
    const dt = current - this.lastTime;

    this.counter += dt;
    this.lastTime = current;

    let i = 0;

    while (this.counter > MPF && i < MAX_FRAMES_PER_UPDATE) {
      this.updateFn(SPF);

      this.counter -= MPF;
      i++;
    }

    this.drawFn?.();

    requestAnimationFrame(this.run);
  };
}
