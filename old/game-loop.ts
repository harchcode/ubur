import { MPF } from "./constants";
import { UpdaterInterface, DrawerInterface } from "./types";

const SPF = MPF * 0.001;
const raf = requestAnimationFrame || setTimeout;

export class GameLoop {
  private startTime = 0;
  private lastTime = 0;

  private counter = 0;
  private updater: UpdaterInterface;
  private drawer?: DrawerInterface;

  constructor(updater: UpdaterInterface, drawer?: DrawerInterface) {
    this.updater = updater;
    this.drawer = drawer;
  }

  start = () => {
    this.startTime = Date.now();
    this.lastTime = this.startTime;

    raf(this.run);
  };

  private run = () => {
    const current = Date.now();
    const dt = current - this.lastTime;

    this.counter += dt;
    this.lastTime = current;

    while (this.counter > MPF) {
      this.updater.update(SPF);
      this.drawer?.update(SPF);

      this.counter -= MPF;
    }

    this.drawer?.draw();

    raf(this.run);
  };
}
