/**
 * A generic dynamic array (resizable array) that automatically grows
 * when capacity is exhausted. Demonstrates the amortized O(1) append
 * strategy used by real-world array implementations.
 *
 * Time complexity:
 *   - get / set: O(1)
 *   - append:    O(1) amortized (O(n) worst case during resize)
 *   - insert:    O(n)
 *   - remove:    O(n)
 *
 * Space complexity: O(n)
 */
export class DynamicArray<T> implements Iterable<T> {
  private data: (T | undefined)[];
  private length: number;

  /** Create a DynamicArray with an optional initial capacity (default 4). */
  constructor(initialCapacity = 4) {
    this.data = new Array<T | undefined>(initialCapacity);
    this.length = 0;
  }

  /** The number of elements currently stored. */
  get size(): number {
    return this.length;
  }

  /** The current internal buffer capacity. */
  get capacity(): number {
    return this.data.length;
  }

  /** Return the element at `index`. Throws if out of bounds. */
  get(index: number): T {
    this.checkBounds(index);
    return this.data[index] as T;
  }

  /** Set the element at `index` to `value`. Throws if out of bounds. */
  set(index: number, value: T): void {
    this.checkBounds(index);
    this.data[index] = value;
  }

  /** Append `value` to the end of the array. Amortized O(1). */
  append(value: T): void {
    if (this.length === this.data.length) {
      this.resize(this.data.length * 2);
    }
    this.data[this.length] = value;
    this.length++;
  }

  /**
   * Insert `value` at `index`, shifting subsequent elements right. O(n).
   * `index` may equal `this.size` to append at the end.
   */
  insert(index: number, value: T): void {
    if (index < 0 || index > this.length) {
      throw new RangeError(`Index ${index} out of bounds for size ${this.length}`);
    }
    if (this.length === this.data.length) {
      this.resize(this.data.length * 2);
    }
    // Shift elements right
    for (let i = this.length; i > index; i--) {
      this.data[i] = this.data[i - 1];
    }
    this.data[index] = value;
    this.length++;
  }

  /**
   * Remove and return the element at `index`, shifting subsequent elements left. O(n).
   * Shrinks the buffer when occupancy falls below 25%.
   */
  remove(index: number): T {
    this.checkBounds(index);
    const value = this.data[index] as T;
    // Shift elements left
    for (let i = index; i < this.length - 1; i++) {
      this.data[i] = this.data[i + 1];
    }
    this.data[this.length - 1] = undefined;
    this.length--;
    // Shrink when 1/4 full (but not below initial capacity of 4)
    if (this.length > 0 && this.length <= this.data.length / 4 && this.data.length > 4) {
      this.resize(Math.max(4, Math.floor(this.data.length / 2)));
    }
    return value;
  }

  /** Remove and return the last element. Throws if empty. */
  pop(): T {
    if (this.length === 0) {
      throw new RangeError('Cannot pop from an empty DynamicArray');
    }
    return this.remove(this.length - 1);
  }

  /** Return the index of the first occurrence of `value`, or -1 if not found. */
  indexOf(value: T): number {
    for (let i = 0; i < this.length; i++) {
      if (this.data[i] === value) return i;
    }
    return -1;
  }

  /** Return true if the array contains `value`. */
  contains(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  /** Iterate over the elements in order. */
  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.length; i++) {
      yield this.data[i] as T;
    }
  }

  /** Return a plain array copy of the elements. */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.length; i++) {
      result.push(this.data[i] as T);
    }
    return result;
  }

  private resize(newCapacity: number): void {
    const newData = new Array<T | undefined>(newCapacity);
    for (let i = 0; i < this.length; i++) {
      newData[i] = this.data[i];
    }
    this.data = newData;
  }

  private checkBounds(index: number): void {
    if (index < 0 || index >= this.length) {
      throw new RangeError(`Index ${index} out of bounds for size ${this.length}`);
    }
  }
}
