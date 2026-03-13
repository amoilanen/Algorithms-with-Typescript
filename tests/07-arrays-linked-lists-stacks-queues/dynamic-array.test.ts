import { describe, it, expect } from 'vitest';
import { DynamicArray } from '../../src/07-arrays-linked-lists-stacks-queues/dynamic-array';

describe('DynamicArray', () => {
  it('should start empty', () => {
    const arr = new DynamicArray<number>();
    expect(arr.size).toBe(0);
    expect(arr.toArray()).toEqual([]);
  });

  it('should append elements and track size', () => {
    const arr = new DynamicArray<number>();
    arr.append(10);
    arr.append(20);
    arr.append(30);
    expect(arr.size).toBe(3);
    expect(arr.toArray()).toEqual([10, 20, 30]);
  });

  it('should get elements by index', () => {
    const arr = new DynamicArray<string>();
    arr.append('a');
    arr.append('b');
    arr.append('c');
    expect(arr.get(0)).toBe('a');
    expect(arr.get(1)).toBe('b');
    expect(arr.get(2)).toBe('c');
  });

  it('should throw on out-of-bounds get', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    expect(() => arr.get(-1)).toThrow(RangeError);
    expect(() => arr.get(1)).toThrow(RangeError);
    expect(() => arr.get(100)).toThrow(RangeError);
  });

  it('should set elements by index', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    arr.append(2);
    arr.set(0, 99);
    expect(arr.get(0)).toBe(99);
    expect(arr.get(1)).toBe(2);
  });

  it('should throw on out-of-bounds set', () => {
    const arr = new DynamicArray<number>();
    expect(() => arr.set(0, 1)).toThrow(RangeError);
  });

  it('should insert at the beginning', () => {
    const arr = new DynamicArray<number>();
    arr.append(2);
    arr.append(3);
    arr.insert(0, 1);
    expect(arr.toArray()).toEqual([1, 2, 3]);
  });

  it('should insert in the middle', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    arr.append(3);
    arr.insert(1, 2);
    expect(arr.toArray()).toEqual([1, 2, 3]);
  });

  it('should insert at the end (same as append)', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    arr.insert(1, 2);
    expect(arr.toArray()).toEqual([1, 2]);
  });

  it('should throw on out-of-bounds insert', () => {
    const arr = new DynamicArray<number>();
    expect(() => arr.insert(-1, 0)).toThrow(RangeError);
    expect(() => arr.insert(1, 0)).toThrow(RangeError);
  });

  it('should remove elements and shift remaining', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    arr.append(2);
    arr.append(3);
    const removed = arr.remove(1);
    expect(removed).toBe(2);
    expect(arr.toArray()).toEqual([1, 3]);
    expect(arr.size).toBe(2);
  });

  it('should remove the first element', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    arr.append(2);
    expect(arr.remove(0)).toBe(1);
    expect(arr.toArray()).toEqual([2]);
  });

  it('should remove the last element', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    arr.append(2);
    expect(arr.remove(1)).toBe(2);
    expect(arr.toArray()).toEqual([1]);
  });

  it('should throw on out-of-bounds remove', () => {
    const arr = new DynamicArray<number>();
    expect(() => arr.remove(0)).toThrow(RangeError);
  });

  it('should pop the last element', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    arr.append(2);
    arr.append(3);
    expect(arr.pop()).toBe(3);
    expect(arr.size).toBe(2);
    expect(arr.pop()).toBe(2);
    expect(arr.pop()).toBe(1);
    expect(arr.size).toBe(0);
  });

  it('should throw when popping from empty array', () => {
    const arr = new DynamicArray<number>();
    expect(() => arr.pop()).toThrow(RangeError);
  });

  it('should find elements with indexOf', () => {
    const arr = new DynamicArray<number>();
    arr.append(10);
    arr.append(20);
    arr.append(30);
    expect(arr.indexOf(20)).toBe(1);
    expect(arr.indexOf(99)).toBe(-1);
  });

  it('should check containment', () => {
    const arr = new DynamicArray<string>();
    arr.append('hello');
    expect(arr.contains('hello')).toBe(true);
    expect(arr.contains('world')).toBe(false);
  });

  it('should resize when capacity is exceeded', () => {
    const arr = new DynamicArray<number>(2);
    expect(arr.capacity).toBe(2);
    arr.append(1);
    arr.append(2);
    expect(arr.capacity).toBe(2);
    arr.append(3); // triggers resize
    expect(arr.capacity).toBe(4);
    expect(arr.toArray()).toEqual([1, 2, 3]);
  });

  it('should shrink when occupancy drops below 25%', () => {
    const arr = new DynamicArray<number>(4);
    // Fill to force growth
    for (let i = 0; i < 16; i++) arr.append(i);
    expect(arr.capacity).toBe(16);
    // Remove elements to trigger shrinking
    for (let i = 15; i >= 4; i--) arr.pop();
    // After removing down to 4 elements in capacity 16, should shrink
    expect(arr.capacity).toBeLessThan(16);
    expect(arr.toArray()).toEqual([0, 1, 2, 3]);
  });

  it('should be iterable with for-of', () => {
    const arr = new DynamicArray<number>();
    arr.append(1);
    arr.append(2);
    arr.append(3);
    const result: number[] = [];
    for (const v of arr) result.push(v);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle single element operations', () => {
    const arr = new DynamicArray<number>();
    arr.append(42);
    expect(arr.size).toBe(1);
    expect(arr.get(0)).toBe(42);
    expect(arr.remove(0)).toBe(42);
    expect(arr.size).toBe(0);
  });
});
