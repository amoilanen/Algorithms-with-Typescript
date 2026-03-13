import { describe, it, expect } from 'vitest';
import { Stack } from '../../src/07-arrays-linked-lists-stacks-queues/stack';

describe('Stack', () => {
  it('should start empty', () => {
    const stack = new Stack<number>();
    expect(stack.size).toBe(0);
    expect(stack.isEmpty).toBe(true);
    expect(stack.toArray()).toEqual([]);
  });

  it('should push and pop in LIFO order', () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBeUndefined();
  });

  it('should track size correctly', () => {
    const stack = new Stack<number>();
    expect(stack.size).toBe(0);
    stack.push(1);
    expect(stack.size).toBe(1);
    stack.push(2);
    expect(stack.size).toBe(2);
    stack.pop();
    expect(stack.size).toBe(1);
    stack.pop();
    expect(stack.size).toBe(0);
  });

  it('should peek without removing', () => {
    const stack = new Stack<number>();
    expect(stack.peek()).toBeUndefined();
    stack.push(10);
    stack.push(20);
    expect(stack.peek()).toBe(20);
    expect(stack.size).toBe(2); // size unchanged after peek
  });

  it('should report isEmpty correctly', () => {
    const stack = new Stack<number>();
    expect(stack.isEmpty).toBe(true);
    stack.push(1);
    expect(stack.isEmpty).toBe(false);
    stack.pop();
    expect(stack.isEmpty).toBe(true);
  });

  it('should return undefined when popping from empty stack', () => {
    const stack = new Stack<number>();
    expect(stack.pop()).toBeUndefined();
  });

  it('should be iterable (top to bottom)', () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    const result: number[] = [];
    for (const v of stack) result.push(v);
    expect(result).toEqual([3, 2, 1]); // top first
  });

  it('should handle strings', () => {
    const stack = new Stack<string>();
    stack.push('a');
    stack.push('b');
    expect(stack.pop()).toBe('b');
    expect(stack.pop()).toBe('a');
  });

  it('should handle single element', () => {
    const stack = new Stack<number>();
    stack.push(42);
    expect(stack.peek()).toBe(42);
    expect(stack.size).toBe(1);
    expect(stack.pop()).toBe(42);
    expect(stack.isEmpty).toBe(true);
  });

  it('should handle push after pop to empty', () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.pop();
    stack.push(2);
    expect(stack.peek()).toBe(2);
    expect(stack.size).toBe(1);
  });
});
