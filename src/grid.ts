import { Sphere, GridInterface } from './types';
import { WORLD_L, MAX_SPHERE_R } from './constants';

export class Grid implements GridInterface {
  private l = 0;
  private cols = 0;
  private cellCount = 0;
  private cellL = 0;
  private cells: Set<Sphere>[] = [];

  constructor() {
    this.l = WORLD_L;
    this.cellL = MAX_SPHERE_R * 2;
    this.cols = this.l / this.cellL;
    this.cellCount = this.cols * this.cols;

    for (let i = 0; i < this.cellCount; i++) {
      this.cells.push(new Set<Sphere>());
    }
  }

  insert(sphere: Sphere) {
    const col = Math.floor(sphere.x / (this.cellL + 1));
    const row = Math.floor(sphere.y / (this.cellL + 1));
    const index = row * this.cols + col;

    this.cells[index].add(sphere);
  }

  remove(sphere: Sphere) {
    const col = Math.floor(sphere.x / (this.cellL + 1));
    const row = Math.floor(sphere.y / (this.cellL + 1));
    const index = row * this.cols + col;

    this.cells[index].delete(sphere);
  }

  move(sphere: Sphere, oldX: number, oldY: number) {
    const col = Math.floor(sphere.x / (this.cellL + 1));
    const row = Math.floor(sphere.y / (this.cellL + 1));
    const index = row * this.cols + col;

    const oldCol = Math.floor(oldX / (this.cellL + 1));
    const oldRow = Math.floor(oldY / (this.cellL + 1));
    const oldIndex = oldRow * this.cols + oldCol;

    if (index !== oldIndex) {
      this.cells[oldIndex].delete(sphere);
      this.cells[index].add(sphere);
    }
  }

  update(dt: number, updateFn: (dt: number, sphere: Sphere) => void) {
    for (let i = 0; i < this.cellCount; i++) {
      const cell = this.cells[i];

      for (const sphere of cell) {
        updateFn(dt, sphere);
      }
    }
  }

  forEach(fn: (sphere: Sphere) => void) {
    for (let i = 0; i < this.cellCount; i++) {
      const cell = this.cells[i];

      for (const sphere of cell) {
        fn(sphere);
      }
    }
  }

  checkCollisions(
    checkerFunc: (s1: Sphere, s2: Sphere) => boolean,
    onCollisionFunc: (s1: Sphere, s2: Sphere) => void
  ) {
    const last = this.cols - 1;

    for (let i = 0; i < this.cellCount; i++) {
      const cell = this.cells[i];
      this.checkCollisionInCell(cell, checkerFunc, onCollisionFunc);
    }

    for (let row = 0; row < this.cols; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell1 = this.getCell(col, row);

        if (col < last) {
          const cell2 = this.getCell(col + 1, row);
          this.checkCollisionCrossCell(
            cell1,
            cell2,
            checkerFunc,
            onCollisionFunc
          );
        }

        if (row < last) {
          const cell2 = this.getCell(col, row + 1);
          this.checkCollisionCrossCell(
            cell1,
            cell2,
            checkerFunc,
            onCollisionFunc
          );
        }

        if (col < last && row < last) {
          const cell2 = this.getCell(col + 1, row + 1);
          this.checkCollisionCrossCell(
            cell1,
            cell2,
            checkerFunc,
            onCollisionFunc
          );
        }

        if (col > 0 && row < last) {
          const cell2 = this.getCell(col - 1, row + 1);
          this.checkCollisionCrossCell(
            cell1,
            cell2,
            checkerFunc,
            onCollisionFunc
          );
        }
      }
    }
  }

  private checkCollisionInCell(
    cell: Set<Sphere>,
    checkerFunc: (s1: Sphere, s2: Sphere) => boolean,
    onCollisionFunc: (s1: Sphere, s2: Sphere) => void
  ) {
    for (const s1 of cell) {
      for (const s2 of cell) {
        if (s2.id <= s1.id) continue;

        if (checkerFunc(s1, s2)) onCollisionFunc(s1, s2);
      }
    }
  }

  private checkCollisionCrossCell(
    cell1: Set<Sphere>,
    cell2: Set<Sphere>,
    checkerFunc: (s1: Sphere, s2: Sphere) => boolean,
    onCollisionFunc: (s1: Sphere, s2: Sphere) => void
  ) {
    for (const s1 of cell1) {
      for (const s2 of cell2) {
        if (checkerFunc(s1, s2)) onCollisionFunc(s1, s2);
      }
    }
  }

  private getCell(col: number, row: number) {
    return this.cells[row * this.cols + col];
  }
}
