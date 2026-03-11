import { describe, it, expect } from 'vitest';
import { Deque } from '../../src/07-arrays-linked-lists-stacks-queues/deque.js';

describe('Deque', () => {
  it('should start empty', () => {
    const d = new Deque<number>();
    expect(d.size).toBe(0);
    expect(d.isEmpty).toBe(true);
    expect(d.toArray()).toEqual([]);
  });

  it('should pushFront elements', () => {
    const d = new Deque<number>();
    d.pushFront(3);
    d.pushFront(2);
    d.pushFront(1);
    expect(d.toArray()).toEqual([1, 2, 3]);
  });

  it('should pushBack elements', () => {
    const d = new Deque<number>();
    d.pushBack(1);
    d.pushBack(2);
    d.pushBack(3);
    expect(d.toArray()).toEqual([1, 2, 3]);
  });

  it('should popFront in order', () => {
    const d = new Deque<number>();
    d.pushBack(1);
    d.pushBack(2);
    d.pushBack(3);
    expect(d.popFront()).toBe(1);
    expect(d.popFront()).toBe(2);
    expect(d.popFront()).toBe(3);
    expect(d.popFront()).toBeUndefined();
  });

  it('should popBack in reverse order', () => {
    const d = new Deque<number>();
    d.pushBack(1);
    d.pushBack(2);
    d.pushBack(3);
    expect(d.popBack()).toBe(3);
    expect(d.popBack()).toBe(2);
    expect(d.popBack()).toBe(1);
    expect(d.popBack()).toBeUndefined();
  });

  it('should peekFront and peekBack', () => {
    const d = new Deque<number>();
    expect(d.peekFront()).toBeUndefined();
    expect(d.peekBack()).toBeUndefined();
    d.pushBack(10);
    d.pushBack(20);
    expect(d.peekFront()).toBe(10);
    expect(d.peekBack()).toBe(20);
    expect(d.size).toBe(2); // unchanged
  });

  it('should track size correctly', () => {
    const d = new Deque<number>();
    d.pushBack(1);
    expect(d.size).toBe(1);
    d.pushFront(0);
    expect(d.size).toBe(2);
    d.popFront();
    expect(d.size).toBe(1);
    d.popBack();
    expect(d.size).toBe(0);
    expect(d.isEmpty).toBe(true);
  });

  it('should handle single element via front', () => {
    const d = new Deque<number>();
    d.pushFront(42);
    expect(d.peekFront()).toBe(42);
    expect(d.peekBack()).toBe(42);
    expect(d.popFront()).toBe(42);
    expect(d.isEmpty).toBe(true);
  });

  it('should handle single element via back', () => {
    const d = new Deque<number>();
    d.pushBack(42);
    expect(d.peekFront()).toBe(42);
    expect(d.peekBack()).toBe(42);
    expect(d.popBack()).toBe(42);
    expect(d.isEmpty).toBe(true);
  });

  it('should work as a stack (pushFront/popFront)', () => {
    const d = new Deque<number>();
    d.pushFront(1);
    d.pushFront(2);
    d.pushFront(3);
    expect(d.popFront()).toBe(3);
    expect(d.popFront()).toBe(2);
    expect(d.popFront()).toBe(1);
  });

  it('should work as a queue (pushBack/popFront)', () => {
    const d = new Deque<number>();
    d.pushBack(1);
    d.pushBack(2);
    d.pushBack(3);
    expect(d.popFront()).toBe(1);
    expect(d.popFront()).toBe(2);
    expect(d.popFront()).toBe(3);
  });

  it('should be iterable (front to back)', () => {
    const d = new Deque<number>();
    d.pushBack(1);
    d.pushBack(2);
    d.pushBack(3);
    const result: number[] = [];
    for (const v of d) result.push(v);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle mixed front/back operations', () => {
    const d = new Deque<number>();
    d.pushBack(2);
    d.pushFront(1);
    d.pushBack(3);
    d.pushFront(0);
    expect(d.toArray()).toEqual([0, 1, 2, 3]);
    expect(d.popFront()).toBe(0);
    expect(d.popBack()).toBe(3);
    expect(d.toArray()).toEqual([1, 2]);
  });

  it('should handle operations after emptying', () => {
    const d = new Deque<number>();
    d.pushBack(1);
    d.popFront();
    d.pushFront(2);
    expect(d.peekFront()).toBe(2);
    expect(d.peekBack()).toBe(2);
    expect(d.size).toBe(1);
  });
});
