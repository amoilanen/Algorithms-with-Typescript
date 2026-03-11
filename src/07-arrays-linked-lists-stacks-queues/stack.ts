/**
 * Interface for a stack (LIFO) abstract data type.
 */
export interface IStack<T> {
  /** Push a value onto the top of the stack. */
  push(value: T): void;
  /** Remove and return the top element. Returns undefined if empty. */
  pop(): T | undefined;
  /** Return the top element without removing it. Returns undefined if empty. */
  peek(): T | undefined;
  /** The number of elements in the stack. */
  readonly size: number;
  /** True if the stack contains no elements. */
  readonly isEmpty: boolean;
}

/**
 * A generic stack implemented with a linked structure for O(1) push/pop.
 *
 * Time complexity:
 *   - push: O(1)
 *   - pop:  O(1)
 *   - peek: O(1)
 *
 * Space complexity: O(n)
 */
export class Stack<T> implements IStack<T>, Iterable<T> {
  private head: { value: T; next: { value: T; next: unknown } | null } | null = null;
  private length = 0;

  /** The number of elements in the stack. */
  get size(): number {
    return this.length;
  }

  /** True if the stack contains no elements. */
  get isEmpty(): boolean {
    return this.length === 0;
  }

  /** Push a value onto the top of the stack. O(1). */
  push(value: T): void {
    this.head = { value, next: this.head };
    this.length++;
  }

  /** Remove and return the top element. Returns undefined if empty. O(1). */
  pop(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next as typeof this.head;
    this.length--;
    return value;
  }

  /** Return the top element without removing it. Returns undefined if empty. O(1). */
  peek(): T | undefined {
    return this.head?.value;
  }

  /** Iterate from top to bottom. */
  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.value;
      current = current.next as typeof this.head;
    }
  }

  /** Return a plain array of elements (top first). */
  toArray(): T[] {
    return [...this];
  }
}
