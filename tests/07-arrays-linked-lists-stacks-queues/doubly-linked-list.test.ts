import { describe, it, expect } from 'vitest';
import { DoublyLinkedList } from '../../src/07-arrays-linked-lists-stacks-queues/doubly-linked-list.js';

describe('DoublyLinkedList', () => {
  it('should start empty', () => {
    const list = new DoublyLinkedList<number>();
    expect(list.size).toBe(0);
    expect(list.toArray()).toEqual([]);
  });

  it('should prepend elements', () => {
    const list = new DoublyLinkedList<number>();
    list.prepend(3);
    list.prepend(2);
    list.prepend(1);
    expect(list.toArray()).toEqual([1, 2, 3]);
    expect(list.size).toBe(3);
  });

  it('should append elements', () => {
    const list = new DoublyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
    expect(list.size).toBe(3);
  });

  it('should peek front and back', () => {
    const list = new DoublyLinkedList<number>();
    expect(list.peekFront()).toBeUndefined();
    expect(list.peekBack()).toBeUndefined();
    list.append(10);
    list.append(20);
    expect(list.peekFront()).toBe(10);
    expect(list.peekBack()).toBe(20);
  });

  it('should removeFirst correctly', () => {
    const list = new DoublyLinkedList<number>();
    expect(list.removeFirst()).toBeUndefined();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.removeFirst()).toBe(1);
    expect(list.toArray()).toEqual([2, 3]);
    expect(list.size).toBe(2);
  });

  it('should removeLast correctly', () => {
    const list = new DoublyLinkedList<number>();
    expect(list.removeLast()).toBeUndefined();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.removeLast()).toBe(3);
    expect(list.toArray()).toEqual([1, 2]);
    expect(list.size).toBe(2);
  });

  it('should handle removing the only element via removeFirst', () => {
    const list = new DoublyLinkedList<number>();
    list.append(42);
    expect(list.removeFirst()).toBe(42);
    expect(list.size).toBe(0);
    expect(list.peekFront()).toBeUndefined();
    expect(list.peekBack()).toBeUndefined();
  });

  it('should handle removing the only element via removeLast', () => {
    const list = new DoublyLinkedList<number>();
    list.append(42);
    expect(list.removeLast()).toBe(42);
    expect(list.size).toBe(0);
    expect(list.peekFront()).toBeUndefined();
    expect(list.peekBack()).toBeUndefined();
  });

  it('should delete a value from the head', () => {
    const list = new DoublyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.delete(1)).toBe(true);
    expect(list.toArray()).toEqual([2, 3]);
    expect(list.peekFront()).toBe(2);
  });

  it('should delete a value from the middle', () => {
    const list = new DoublyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.delete(2)).toBe(true);
    expect(list.toArray()).toEqual([1, 3]);
  });

  it('should delete a value from the tail', () => {
    const list = new DoublyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.delete(3)).toBe(true);
    expect(list.toArray()).toEqual([1, 2]);
    expect(list.peekBack()).toBe(2);
  });

  it('should return false when deleting a non-existent value', () => {
    const list = new DoublyLinkedList<number>();
    list.append(1);
    expect(list.delete(99)).toBe(false);
    expect(list.size).toBe(1);
  });

  it('should find elements', () => {
    const list = new DoublyLinkedList<string>();
    list.append('a');
    list.append('b');
    expect(list.find('a')).toBe(true);
    expect(list.find('c')).toBe(false);
  });

  it('should be iterable with for-of', () => {
    const list = new DoublyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result: number[] = [];
    for (const v of list) result.push(v);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should iterate in reverse', () => {
    const list = new DoublyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    const result: number[] = [];
    for (const v of list.reverseIterator()) result.push(v);
    expect(result).toEqual([3, 2, 1]);
  });

  it('should work correctly after mixed operations', () => {
    const list = new DoublyLinkedList<number>();
    list.append(1);
    list.append(2);
    list.prepend(0);
    list.removeLast();
    list.append(3);
    list.removeFirst();
    expect(list.toArray()).toEqual([1, 3]);
    expect(list.peekFront()).toBe(1);
    expect(list.peekBack()).toBe(3);
  });
});
