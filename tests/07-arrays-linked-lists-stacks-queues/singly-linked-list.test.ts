import { describe, it, expect } from 'vitest';
import { SinglyLinkedList } from '../../src/07-arrays-linked-lists-stacks-queues/singly-linked-list';

describe('SinglyLinkedList', () => {
  it('should start empty', () => {
    const list = new SinglyLinkedList<number>();
    expect(list.size).toBe(0);
    expect(list.toArray()).toEqual([]);
  });

  it('should prepend elements', () => {
    const list = new SinglyLinkedList<number>();
    list.prepend(3);
    list.prepend(2);
    list.prepend(1);
    expect(list.toArray()).toEqual([1, 2, 3]);
    expect(list.size).toBe(3);
  });

  it('should append elements', () => {
    const list = new SinglyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
    expect(list.size).toBe(3);
  });

  it('should mix prepend and append', () => {
    const list = new SinglyLinkedList<number>();
    list.append(2);
    list.prepend(1);
    list.append(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('should peek front and back', () => {
    const list = new SinglyLinkedList<number>();
    expect(list.peekFront()).toBeUndefined();
    expect(list.peekBack()).toBeUndefined();
    list.append(10);
    list.append(20);
    expect(list.peekFront()).toBe(10);
    expect(list.peekBack()).toBe(20);
  });

  it('should remove the first element', () => {
    const list = new SinglyLinkedList<number>();
    expect(list.removeFirst()).toBeUndefined();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.removeFirst()).toBe(1);
    expect(list.toArray()).toEqual([2, 3]);
    expect(list.size).toBe(2);
  });

  it('should remove the only element', () => {
    const list = new SinglyLinkedList<number>();
    list.append(42);
    expect(list.removeFirst()).toBe(42);
    expect(list.size).toBe(0);
    expect(list.peekFront()).toBeUndefined();
    expect(list.peekBack()).toBeUndefined();
  });

  it('should delete a value from the head', () => {
    const list = new SinglyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.delete(1)).toBe(true);
    expect(list.toArray()).toEqual([2, 3]);
  });

  it('should delete a value from the middle', () => {
    const list = new SinglyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.delete(2)).toBe(true);
    expect(list.toArray()).toEqual([1, 3]);
  });

  it('should delete a value from the tail', () => {
    const list = new SinglyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.delete(3)).toBe(true);
    expect(list.toArray()).toEqual([1, 2]);
    expect(list.peekBack()).toBe(2);
  });

  it('should return false when deleting a non-existent value', () => {
    const list = new SinglyLinkedList<number>();
    list.append(1);
    expect(list.delete(99)).toBe(false);
    expect(list.size).toBe(1);
  });

  it('should return false when deleting from empty list', () => {
    const list = new SinglyLinkedList<number>();
    expect(list.delete(1)).toBe(false);
  });

  it('should find elements', () => {
    const list = new SinglyLinkedList<string>();
    list.append('a');
    list.append('b');
    list.append('c');
    expect(list.find('b')).toBe(true);
    expect(list.find('z')).toBe(false);
  });

  it('should be iterable with for-of', () => {
    const list = new SinglyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result: number[] = [];
    for (const v of list) result.push(v);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should maintain correct tail after deleting the only element', () => {
    const list = new SinglyLinkedList<number>();
    list.append(1);
    list.delete(1);
    expect(list.size).toBe(0);
    // Append should still work correctly after tail was reset
    list.append(2);
    expect(list.toArray()).toEqual([2]);
    expect(list.peekFront()).toBe(2);
    expect(list.peekBack()).toBe(2);
  });

  it('should handle strings', () => {
    const list = new SinglyLinkedList<string>();
    list.append('hello');
    list.append('world');
    expect(list.find('hello')).toBe(true);
    expect(list.toArray()).toEqual(['hello', 'world']);
  });
});
