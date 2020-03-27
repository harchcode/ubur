import { Sphere, GridInterface, PoolInterface } from './types';
import { WORLD_L, MAX_SPHERE_R } from './constants';

const output: Sphere[] = [];

export class Grid implements GridInterface {
  private l = 0;
  private cols = 0;
  private cellL = 0;
  private cells: Set<Sphere>[] = [];

  constructor() {
    this.l = WORLD_L;
    this.cellL = MAX_SPHERE_R * 2;
    this.cols = this.l / this.cellL;

    for (let i = 0; i < this.cols * this.cols; i++) {
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

  checkCollisions(
    checkerFunc: (s1: Sphere, s2: Sphere) => boolean,
    onCollisionFunc: (s1: Sphere, s2: Sphere) => void
  ) {
    const totalCells = this.cols * this.cols;
    const last = this.cols - 1;

    for (let i = 0; i < totalCells; i++) {
      const spheres = this.cells[i];

      for (const s1 of spheres) {
        for (const s2 of spheres) {
          if (s2.id <= s1.id) continue;

          if (checkerFunc(s1, s2)) onCollisionFunc(s1, s2);
        }
      }
    }

    for (let row = 0; row < this.cols; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell1 = this.getCell(col, row);

        if (col < last) {
          const cell2 = this.getCell(col + 1, row);

          for (const s1 of cell1) {
            for (const s2 of cell2) {
              if (checkerFunc(s1, s2)) onCollisionFunc(s1, s2);
            }
          }
        }

        if (row < last) {
          const cell2 = this.getCell(col, row + 1);

          for (const s1 of cell1) {
            for (const s2 of cell2) {
              if (checkerFunc(s1, s2)) onCollisionFunc(s1, s2);
            }
          }
        }

        if (col < last && row < last) {
          const cell2 = this.getCell(col + 1, row + 1);

          for (const s1 of cell1) {
            for (const s2 of cell2) {
              if (checkerFunc(s1, s2)) onCollisionFunc(s1, s2);
            }
          }
        }

        if (col > 0 && row < last) {
          const cell2 = this.getCell(col - 1, row + 1);

          for (const s1 of cell1) {
            for (const s2 of cell2) {
              if (checkerFunc(s1, s2)) onCollisionFunc(s1, s2);
            }
          }
        }
      }
    }

    // for (const k in spheres.objs) {
    //   if (!spheres.isAlive[k]) continue;
    //   const s1 = spheres.objs[k];
    //   const s2s = this.getCollisionCandidates(s1);
    //   for (let i = 0; i < s2s.length; i++) {
    //     const s2 = s2s[i];
    //     if (s2.id <= s1.id) continue;
    //     if (checkerFunc(s1, s2)) onCollisionFunc(s1, s2);
    //   }
    // }
  }

  private getCell(col: number, row: number) {
    return this.cells[row * this.cols + col];
  }

  private pushCellData(col: number, row: number, output: Sphere[]) {
    const index = row * this.cols + col;
    const cell = this.cells[index];

    for (const s of cell) {
      output.push(s);
    }
  }
}
