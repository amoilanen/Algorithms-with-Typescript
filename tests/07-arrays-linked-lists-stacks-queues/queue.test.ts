import { describe, it, expect } from 'vitest';
import { Queue } from '../../src/07-arrays-linked-lists-stacks-queues/queue';

describe('Queue', () => {
  it('should start empty', () => {
    const q = new Queue<number>();
    expect(q.size).toBe(0);
    expect(q.isEmpty).toBe(true);
    expect(q.toArray()).toEqual([]);
  });

  it('should enqueue and dequeue in FIFO order', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    expect(q.dequeue()).toBe(1);
    expect(q.dequeue()).toBe(2);
    expect(q.dequeue()).toBe(3);
    expect(q.dequeue()).toBeUndefined();
  });

  it('should track size correctly', () => {
    const q = new Queue<number>();
    expect(q.size).toBe(0);
    q.enqueue(1);
    expect(q.size).toBe(1);
    q.enqueue(2);
    expect(q.size).toBe(2);
    q.dequeue();
    expect(q.size).toBe(1);
    q.dequeue();
    expect(q.size).toBe(0);
  });

  it('should peek without removing', () => {
    const q = new Queue<number>();
    expect(q.peek()).toBeUndefined();
    q.enqueue(10);
    q.enqueue(20);
    expect(q.peek()).toBe(10);
    expect(q.size).toBe(2); // unchanged
  });

  it('should report isEmpty correctly', () => {
    const q = new Queue<number>();
    expect(q.isEmpty).toBe(true);
    q.enqueue(1);
    expect(q.isEmpty).toBe(false);
    q.dequeue();
    expect(q.isEmpty).toBe(true);
  });

  it('should return undefined when dequeuing from empty queue', () => {
    const q = new Queue<number>();
    expect(q.dequeue()).toBeUndefined();
  });

  it('should be iterable (front to back)', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    const result: number[] = [];
    for (const v of q) result.push(v);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle strings', () => {
    const q = new Queue<string>();
    q.enqueue('first');
    q.enqueue('second');
    expect(q.dequeue()).toBe('first');
    expect(q.dequeue()).toBe('second');
  });

  it('should handle single element', () => {
    const q = new Queue<number>();
    q.enqueue(42);
    expect(q.peek()).toBe(42);
    expect(q.size).toBe(1);
    expect(q.dequeue()).toBe(42);
    expect(q.isEmpty).toBe(true);
  });

  it('should handle enqueue after dequeue to empty', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.dequeue();
    q.enqueue(2);
    expect(q.peek()).toBe(2);
    expect(q.size).toBe(1);
    expect(q.dequeue()).toBe(2);
  });

  it('should maintain FIFO across interleaved operations', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.enqueue(2);
    expect(q.dequeue()).toBe(1);
    q.enqueue(3);
    q.enqueue(4);
    expect(q.dequeue()).toBe(2);
    expect(q.dequeue()).toBe(3);
    expect(q.dequeue()).toBe(4);
  });
});
