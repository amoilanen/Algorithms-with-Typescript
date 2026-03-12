/**
 * A node in a doubly linked list.
 */
class DoublyNode<T> {
  constructor(
    public value: T,
    public prev: DoublyNode<T> | null = null,
    public next: DoublyNode<T> | null = null,
  ) {}
}

/**
 * A generic doubly linked list with O(1) head and tail operations.
 *
 * Time complexity:
 *   - prepend / append:     O(1)
 *   - removeFirst / removeLast: O(1)
 *   - find / delete:        O(n)
 *
 * Space complexity: O(n)
 */
export class DoublyLinkedList<T> implements Iterable<T> {
  private head: DoublyNode<T> | null = null;
  private tail: DoublyNode<T> | null = null;
  private length = 0;

  /** The number of elements in the list. */
  get size(): number {
    return this.length;
  }

  /** Insert `value` at the front of the list. O(1). */
  prepend(value: T): void {
    const node = new DoublyNode(value, null, this.head);
    if (this.head !== null) {
      this.head.prev = node;
    } else {
      this.tail = node;
    }
    this.head = node;
    this.length++;
  }

  /** Insert `value` at the end of the list. O(1). */
  append(value: T): void {
    const node = new DoublyNode(value, this.tail, null);
    if (this.tail !== null) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.length++;
  }

  /** Return the first element, or undefined if the list is empty. */
  peekFront(): T | undefined {
    return this.head?.value;
  }

  /** Return the last element, or undefined if the list is empty. */
  peekBack(): T | undefined {
    return this.tail?.value;
  }

  /**
   * Remove and return the first element. O(1).
   * Returns undefined if the list is empty.
   */
  removeFirst(): T | undefined {
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

  /**
   * Remove and return the last element. O(1).
   * Returns undefined if the list is empty.
   */
  removeLast(): T | undefined {
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

  /**
   * Remove the first occurrence of `value`.
   * Returns true if found and removed, false otherwise. O(n).
   */
  delete(value: T): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.value === value) {
        this.removeNode(current);
        return true;
      }
      current = current.next;
    }
    return false;
  }

  /** Return true if `value` is in the list. O(n). */
  find(value: T): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.value === value) return true;
      current = current.next;
    }
    return false;
  }

  /** Iterate over the elements from front to back. */
  *[Symbol.iterator](): Iterator<T> {
    let current = this.head;
    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }

  /** Iterate over the elements from back to front. */
  *reverseIterator(): IterableIterator<T> {
    let current = this.tail;
    while (current !== null) {
      yield current.value;
      current = current.prev;
    }
  }

  /** Return a plain array of the elements. */
  toArray(): T[] {
    return [...this];
  }

  private removeNode(node: DoublyNode<T>): void {
    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    this.length--;
  }
}
