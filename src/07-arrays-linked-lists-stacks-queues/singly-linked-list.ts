/**
 * A node in a singly linked list.
 */
class SinglyNode<T> {
  constructor(
    public value: T,
    public next: SinglyNode<T> | null = null,
  ) {}
}

/**
 * A generic singly linked list.
 *
 * Time complexity:
 *   - prepend:  O(1)
 *   - append:   O(1) (tail pointer maintained)
 *   - contains: O(n)
 *   - delete:   O(n)
 *
 * Space complexity: O(n)
 */
export class SinglyLinkedList<T> implements Iterable<T> {
  private head: SinglyNode<T> | null = null;
  private tail: SinglyNode<T> | null = null;
  private length = 0;

  /** The number of elements in the list. */
  get size(): number {
    return this.length;
  }

  /** Insert `value` at the front of the list. O(1). */
  prepend(value: T): void {
    const node = new SinglyNode(value, this.head);
    this.head = node;
    if (this.tail === null) {
      this.tail = node;
    }
    this.length++;
  }

  /** Insert `value` at the end of the list. O(1). */
  append(value: T): void {
    const node = new SinglyNode(value);
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
   * Remove the node that follows `prev`, or the head node when `prev` is null.
   * Fixes up the head, tail, and length, and returns the removed value (or
   * undefined when there is no node to remove). O(1).
   *
   * This is the single place where the border cases live: removing the head
   * (`prev === null`), removing the tail (`node === this.tail`, so the tail
   * moves back to `prev`, which is null when the list becomes empty), and
   * removing from an empty list (`node === null`).
   */
  private removeAfter(prev: SinglyNode<T> | null): T | undefined {
    const node = prev === null ? this.head : prev.next;
    if (node === null) return undefined;

    if (prev === null) {
      this.head = node.next;
    } else {
      prev.next = node.next;
    }
    if (node === this.tail) {
      this.tail = prev;
    }
    this.length--;
    return node.value;
  }

  /**
   * Remove and return the first element. O(1).
   * Returns undefined if the list is empty.
   */
  removeFirst(): T | undefined {
    return this.removeAfter(null);
  }

  /**
   * Remove the first occurrence of `value` from the list.
   * Returns true if the value was found and removed, false otherwise. O(n).
   */
  delete(value: T): boolean {
    let prev: SinglyNode<T> | null = null;
    let current = this.head;
    while (current !== null) {
      if (current.value === value) {
        this.removeAfter(prev);
        return true;
      }
      prev = current;
      current = current.next;
    }
    return false;
  }

  /** Return true if `value` is in the list. O(n). */
  contains(value: T): boolean {
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

  /** Return a plain array of the elements. */
  toArray(): T[] {
    return [...this];
  }
}
