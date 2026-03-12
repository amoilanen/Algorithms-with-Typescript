/**
 * A node in the deque's internal doubly linked list.
 */
interface DequeNode<T> {
  value: T;
  prev: DequeNode<T> | null;
  next: DequeNode<T> | null;
}

/**
 * A generic double-ended queue (deque) with O(1) operations at both ends.
 *
 * Time complexity:
 *   - pushFront / pushBack: O(1)
 *   - popFront / popBack:   O(1)
 *   - peekFront / peekBack: O(1)
 *
 * Space complexity: O(n)
 */
export class Deque<T> implements Iterable<T> {
  private head: DequeNode<T> | null = null;
  private tail: DequeNode<T> | null = null;
  private length = 0;

  /** The number of elements in the deque. */
  get size(): number {
    return this.length;
  }

  /** True if the deque contains no elements. */
  get isEmpty(): boolean {
    return this.length === 0;
  }

  /** Add a value to the front of the deque. O(1). */
  pushFront(value: T): void {
    const node: DequeNode<T> = { value, prev: null, next: this.head };
    if (this.head !== null) {
      this.head.prev = node;
    } else {
      this.tail = node;
    }
    this.head = node;
    this.length++;
  }

  /** Add a value to the back of the deque. O(1). */
  pushBack(value: T): void {
    const node: DequeNode<T> = { value, prev: this.tail, next: null };
    if (this.tail !== null) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.length++;
  }

  /** Remove and return the front element. Returns undefined if empty. O(1). */
  popFront(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head !== null) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length--;
    return value;
  }

  /** Remove and return the back element. Returns undefined if empty. O(1). */
  popBack(): T | undefined {
    if (this.tail === null) return undefined;
    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail !== null) {
      this.tail.next = null;
    } else {
      this.head = null;
    }
    this.length--;
    return value;
  }

  /** Return the front element without removing it. Returns undefined if empty. O(1). */
  peekFront(): T | undefined {
    return this.head?.value;
  }

  /** Return the back element without removing it. Returns undefined if empty. O(1). */
  peekBack(): T | undefined {
    return this.tail?.value;
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
