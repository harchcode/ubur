import { Poolable, PoolInterface } from './types';
import { nextPowerOf2 } from './utils/math';

export class Pool<T extends Poolable> implements PoolInterface<T> {
  objs: Record<number, T> = Object.create(null);
  isAlive: Record<number, boolean> = Object.create(null);
  private availableIds: number[] = [];
  private currentSize = 0;

  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 128) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    this.expand(nextPowerOf2(initialSize));
  }

  private expand(newSize: number) {
    for (let i = this.currentSize; i < newSize; i++) {
      const newObj = this.createFn();

      newObj.id = i;

      this.isAlive[i] = false;
      this.availableIds.push(i);
      this.objs[i] = newObj;
    }

    this.currentSize = newSize;
  }

  get = (id: number) => this.objs[id];

  obtain() {
    if (this.availableIds.length === 0) {
      this.expand(nextPowerOf2(this.currentSize + 1));
    }

    const id = this.availableIds.pop() as number;
    const obj = this.get(id);

    this.resetFn(obj);
    this.isAlive[id] = true;

    return obj;
  }

  free(obj: T | number) {
    const id = typeof obj === 'number' ? obj : obj.id;

    this.isAlive[id] = false;
    this.availableIds.push(id);
  }
}
