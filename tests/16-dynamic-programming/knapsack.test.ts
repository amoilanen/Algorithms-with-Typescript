import { describe, it, expect } from 'vitest';
import { knapsack } from '../../src/16-dynamic-programming/knapsack';
import type { KnapsackItem } from '../../src/16-dynamic-programming/knapsack';

describe('knapsack', () => {
  it('throws on negative capacity', () => {
    expect(() => knapsack([], -1)).toThrow(RangeError);
  });

  it('returns 0 for empty items', () => {
    const result = knapsack([], 10);
    expect(result.maxValue).toBe(0);
    expect(result.selectedItems).toEqual([]);
    expect(result.totalWeight).toBe(0);
  });

  it('returns 0 for zero capacity', () => {
    const items: KnapsackItem[] = [
      { weight: 5, value: 10 },
      { weight: 3, value: 7 },
    ];
    const result = knapsack(items, 0);
    expect(result.maxValue).toBe(0);
    expect(result.selectedItems).toEqual([]);
  });

  it('skips items that are too heavy', () => {
    const items: KnapsackItem[] = [
      { weight: 100, value: 1000 },
      { weight: 2, value: 5 },
    ];
    const result = knapsack(items, 5);
    expect(result.maxValue).toBe(5);
    expect(result.selectedItems).toEqual([1]);
    expect(result.totalWeight).toBe(2);
  });

  it('solves the classic textbook example', () => {
    // Classic example: capacity 50
    const items: KnapsackItem[] = [
      { weight: 10, value: 60 },
      { weight: 20, value: 100 },
      { weight: 30, value: 120 },
    ];
    const result = knapsack(items, 50);
    // Best: items 1 and 2 (weight 20+30=50, value 100+120=220)
    expect(result.maxValue).toBe(220);
    expect(result.selectedItems).toEqual([1, 2]);
    expect(result.totalWeight).toBe(50);
  });

  it('takes all items if capacity is sufficient', () => {
    const items: KnapsackItem[] = [
      { weight: 1, value: 10 },
      { weight: 2, value: 20 },
      { weight: 3, value: 30 },
    ];
    const result = knapsack(items, 100);
    expect(result.maxValue).toBe(60);
    expect(result.selectedItems).toEqual([0, 1, 2]);
    expect(result.totalWeight).toBe(6);
  });

  it('handles a single item that fits', () => {
    const items: KnapsackItem[] = [{ weight: 5, value: 10 }];
    const result = knapsack(items, 5);
    expect(result.maxValue).toBe(10);
    expect(result.selectedItems).toEqual([0]);
  });

  it('handles a single item that does not fit', () => {
    const items: KnapsackItem[] = [{ weight: 10, value: 100 }];
    const result = knapsack(items, 5);
    expect(result.maxValue).toBe(0);
    expect(result.selectedItems).toEqual([]);
  });

  it('selected items do not exceed capacity', () => {
    const items: KnapsackItem[] = [
      { weight: 2, value: 3 },
      { weight: 3, value: 4 },
      { weight: 4, value: 5 },
      { weight: 5, value: 8 },
      { weight: 9, value: 10 },
    ];
    const capacity = 20;
    const result = knapsack(items, capacity);
    expect(result.totalWeight).toBeLessThanOrEqual(capacity);
    expect(result.maxValue).toBe(
      result.selectedItems.reduce((sum, i) => sum + items[i]!.value, 0),
    );
  });

  it('solves a larger instance', () => {
    const items: KnapsackItem[] = [
      { weight: 1, value: 1 },
      { weight: 3, value: 4 },
      { weight: 4, value: 5 },
      { weight: 5, value: 7 },
    ];
    const result = knapsack(items, 7);
    // Best: items 1 and 2 (weight 3+4=7, value 4+5=9)
    expect(result.maxValue).toBe(9);
    expect(result.totalWeight).toBeLessThanOrEqual(7);
  });
});
