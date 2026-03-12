/**
 * Interface for a queue (FIFO) abstract data type.
 */
export interface IQueue<T> {
  /** Add a value to the back of the queue. */
  enqueue(value: T): void;
  /** Remove and return the front element. Returns undefined if empty. */
  dequeue(): T | undefined;
  /** Return the front element without removing it. Returns undefined if empty. */
  peek(): T | undefined;
  /** The number of elements in the queue. */
  readonly size: number;
  /** True if the queue contains no elements. */
  readonly isEmpty: boolean;
}

/**
 * A node in the queue's internal linked list.
 */
interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | null;
}

/**
 * A generic queue implemented with a singly linked list for O(1) enqueue/dequeue.
 *
 * Time complexity:
 *   - enqueue: O(1)
 *   - dequeue: O(1)
 *   - peek:    O(1)
 *
 * Space complexity: O(n)
 */
export class Queue<T> implements IQueue<T>, Iterable<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private length = 0;

  /** The number of elements in the queue. */
  get size(): number {
    return this.length;
  }

  /** True if the queue contains no elements. */
  get isEmpty(): boolean {
    return this.length === 0;
  }

  /** Add a value to the back of the queue. O(1). */
  enqueue(value: T): void {
    const node: QueueNode<T> = { value, next: null };
    if (this.tail !== null) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.length++;
  }

  /** Remove and return the front element. Returns undefined if empty. O(1). */
  dequeue(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head === null) {
      this.tail = null;
    }
    this.length--;
    return value;
  }

  /** Return the front element without removing it. Returns undefined if empty. O(1). */
  peek(): T | undefined {
    return this.head?.value;
  }

  /** Iterate from front to back. */
  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }

  /** Return a plain array of elements (front first). */
  toArray(): T[] {
    return [...this];
  }
}
