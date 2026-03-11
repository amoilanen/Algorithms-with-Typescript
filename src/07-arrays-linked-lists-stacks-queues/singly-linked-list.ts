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
 *   - find:     O(n)
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
   * Remove and return the first element. O(1).
   * Returns undefined if the list is empty.
   */
  removeFirst(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head === null) {
      this.tail = null;
    }
    this.length--;
    return value;
  }

  /**
   * Remove the first occurrence of `value` from the list.
   * Returns true if the value was found and removed, false otherwise. O(n).
   */
  delete(value: T): boolean {
    if (this.head === null) return false;

    // Special case: removing the head
    if (this.head.value === value) {
      this.head = this.head.next;
      if (this.head === null) {
        this.tail = null;
      }
      this.length--;
      return true;
    }

    let current = this.head;
    while (current.next !== null) {
      if (current.next.value === value) {
        if (current.next === this.tail) {
          this.tail = current;
        }
        current.next = current.next.next;
        this.length--;
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

  /** Return a plain array of the elements. */
  toArray(): T[] {
    return [...this];
  }
}
