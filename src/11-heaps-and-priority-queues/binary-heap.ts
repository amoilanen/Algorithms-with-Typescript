import type { Comparator } from '../types';
import { numberComparator } from '../types';

// ── Index helpers ────────────────────────────────────────────────

function parentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

function leftIndex(i: number): number {
  return 2 * i + 1;
}

function rightIndex(i: number): number {
  return 2 * i + 2;
}

/**
 * A generic binary heap backed by an array.
 *
 * By default the comparator produces a **min-heap**: the element with the
 * smallest value (according to the comparator) sits at the root. To obtain a
 * max-heap, pass a reversed comparator — for numbers you can use
 * `(a, b) => b - a`.
 *
 * The comparator contract is identical to `Array.prototype.sort`:
 *   - negative → a comes before b (a has higher priority)
 *   - zero     → a and b are equal
 *   - positive → b comes before a (b has higher priority)
 *
 * ### Complexity
 * | Operation    | Time         |
 * |--------------|-------------|
 * | insert       | O(log n)    |
 * | extract      | O(log n)    |
 * | peek         | O(1)        |
 * | decreaseKey  | O(log n)    |
 * | buildHeap    | O(n)        |
 * | size / isEmpty | O(1)      |
 */
export class BinaryHeap<T> {
  private data: T[] = [];
  private readonly compare: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.compare = (comparator ?? numberComparator) as Comparator<T>;
  }

  // ── Static factory ──────────────────────────────────────────────

  /**
   * Build a heap from an existing array in O(n) time (Floyd's algorithm).
   * The input array is not mutated.
   */
  static from<T>(elements: T[], comparator?: Comparator<T>): BinaryHeap<T> {
    const heap = new BinaryHeap<T>(comparator);
    heap.data = elements.slice();
    heap.buildHeap();
    return heap;
  }

  // ── Public API ──────────────────────────────────────────────────

  /** Number of elements in the heap. */
  get size(): number {
    return this.data.length;
  }

  /** Whether the heap is empty. */
  get isEmpty(): boolean {
    return this.data.length === 0;
  }

  /**
   * Return the root element (highest-priority) without removing it.
   * Returns `undefined` if the heap is empty.
   */
  peek(): T | undefined {
    return this.data[0];
  }

  /**
   * Insert a new element into the heap.
   * Time: O(log n)
   */
  insert(value: T): void {
    this.data.push(value);
    this.siftUp(this.data.length - 1);
  }

  /**
   * Remove and return the root element (highest-priority).
   * Returns `undefined` if the heap is empty.
   * Time: O(log n)
   */
  extract(): T | undefined {
    if (this.data.length === 0) return undefined;
    if (this.data.length === 1) return this.data.pop()!;

    const root = this.data[0]!;
    this.data[0] = this.data.pop()!;
    this.siftDown(0);
    return root;
  }

  /**
   * Replace the element at `index` with `newValue`, which must have
   * higher or equal priority (i.e. `compare(newValue, old) <= 0`
   * for a min-heap).
   *
   * This is the classic "decrease-key" operation for min-heaps
   * (or "increase-key" for max-heaps).
   *
   * Time: O(log n)
   * @throws {RangeError} if the index is out of bounds.
   * @throws {Error} if newValue has lower priority than the current value.
   */
  decreaseKey(index: number, newValue: T): void {
    if (index < 0 || index >= this.data.length) {
      throw new RangeError(`Index ${index} out of bounds [0, ${this.data.length})`);
    }
    if (this.compare(newValue, this.data[index]!) > 0) {
      throw new Error('New value has lower priority than the current value');
    }
    this.data[index] = newValue;
    this.siftUp(index);
  }

  /**
   * Return a shallow copy of the internal array (heap-ordered).
   * Useful for inspection and testing.
   */
  toArray(): T[] {
    return this.data.slice();
  }

  /** Iterate over elements in heap-ordered (array) order (not sorted order). */
  [Symbol.iterator](): Iterator<T> {
    let i = 0;
    const data = this.data;
    return {
      next(): IteratorResult<T> {
        if (i < data.length) {
          return { value: data[i++]!, done: false };
        }
        return { value: undefined as unknown as T, done: true };
      },
    };
  }

  // ── Private helpers ─────────────────────────────────────────────

  /**
   * Restore heap order by moving the element at `index` upward.
   */
  private siftUp(index: number): void {
    while (index > 0) {
      const parent = parentIndex(index);
      if (this.compare(this.data[index]!, this.data[parent]!) < 0) {
        this.swap(index, parent);
        index = parent;
      } else {
        break;
      }
    }
  }

  /**
   * Restore heap order by moving the element at `index` downward.
   */
  private siftDown(index: number): void {
    const n = this.data.length;
    while (true) {
      let best = index;
      const left = leftIndex(index);
      const right = rightIndex(index);

      if (left < n && this.compare(this.data[left]!, this.data[best]!) < 0) {
        best = left;
      }
      if (right < n && this.compare(this.data[right]!, this.data[best]!) < 0) {
        best = right;
      }
      if (best === index) break;
      this.swap(index, best);
      index = best;
    }
  }

  /** Swap two elements in the backing array. */
  private swap(i: number, j: number): void {
    const tmp = this.data[i]!;
    this.data[i] = this.data[j]!;
    this.data[j] = tmp;
  }

  /**
   * Establish heap order over the entire backing array in O(n) time
   * (Floyd's build-heap algorithm).
   */
  private buildHeap(): void {
    for (let i = parentIndex(this.data.length - 1); i >= 0; i--) {
      this.siftDown(i);
    }
  }
}
