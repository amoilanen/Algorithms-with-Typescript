import { describe, it, expect } from 'vitest';
import {
  fractionalKnapsack,
  type FractionalKnapsackItem,
} from '../../src/17-greedy-algorithms/fractional-knapsack';

describe('fractionalKnapsack', () => {
  // ── Input validation ──────────────────────────────────────────

  it('throws on negative capacity', () => {
    expect(() => fractionalKnapsack([], -1)).toThrow(RangeError);
  });

  it('throws on non-positive item weight', () => {
    expect(() =>
      fractionalKnapsack([{ weight: 0, value: 10 }], 10),
    ).toThrow(RangeError);
    expect(() =>
      fractionalKnapsack([{ weight: -1, value: 10 }], 10),
    ).toThrow(RangeError);
  });

  it('throws on negative item value', () => {
    expect(() =>
      fractionalKnapsack([{ weight: 5, value: -1 }], 10),
    ).toThrow(RangeError);
  });

  // ── Edge cases ────────────────────────────────────────────────

  it('returns zero for empty items', () => {
    const result = fractionalKnapsack([], 100);
    expect(result.maxValue).toBe(0);
    expect(result.totalWeight).toBe(0);
    expect(result.packedItems).toEqual([]);
  });

  it('returns zero for zero capacity', () => {
    const result = fractionalKnapsack(
      [{ weight: 5, value: 10 }],
      0,
    );
    expect(result.maxValue).toBe(0);
    expect(result.totalWeight).toBe(0);
    expect(result.packedItems).toEqual([]);
  });

  // ── All items fit ─────────────────────────────────────────────

  it('takes all items when they fit', () => {
    const items: FractionalKnapsackItem[] = [
      { weight: 10, value: 60 },
      { weight: 20, value: 100 },
      { weight: 30, value: 120 },
    ];
    const result = fractionalKnapsack(items, 100);
    expect(result.maxValue).toBe(280);
    expect(result.totalWeight).toBe(60);
    expect(result.packedItems.length).toBe(3);
    for (const packed of result.packedItems) {
      expect(packed.fraction).toBe(1);
    }
  });

  // ── Standard example ──────────────────────────────────────────

  it('solves the classic fractional knapsack example', () => {
    const items: FractionalKnapsackItem[] = [
      { weight: 10, value: 60 },  // ratio 6
      { weight: 20, value: 100 }, // ratio 5
      { weight: 30, value: 120 }, // ratio 4
    ];
    const result = fractionalKnapsack(items, 50);
    // Take all of item 0 (w=10, v=60), all of item 1 (w=20, v=100),
    // and 20/30 of item 2 (w=20, v=80). Total = 240.
    expect(result.maxValue).toBe(240);
    expect(result.totalWeight).toBe(50);
  });

  it('packs fractional items correctly', () => {
    const items: FractionalKnapsackItem[] = [
      { weight: 10, value: 60 },
      { weight: 20, value: 100 },
      { weight: 30, value: 120 },
    ];
    const result = fractionalKnapsack(items, 50);

    // The fractional item should have fraction < 1.
    const fractional = result.packedItems.find((p) => p.fraction < 1);
    expect(fractional).toBeDefined();
    expect(fractional!.fraction).toBeCloseTo(2 / 3);
    expect(fractional!.value).toBeCloseTo(80);
  });

  // ── Exact fit ─────────────────────────────────────────────────

  it('handles exact capacity match (no fractions needed)', () => {
    const items: FractionalKnapsackItem[] = [
      { weight: 5, value: 50 },
      { weight: 5, value: 40 },
    ];
    const result = fractionalKnapsack(items, 10);
    expect(result.maxValue).toBe(90);
    expect(result.totalWeight).toBe(10);
    expect(result.packedItems.every((p) => p.fraction === 1)).toBe(true);
  });

  // ── Single item ───────────────────────────────────────────────

  it('takes the whole item when it fits', () => {
    const result = fractionalKnapsack([{ weight: 5, value: 30 }], 10);
    expect(result.maxValue).toBe(30);
    expect(result.totalWeight).toBe(5);
    expect(result.packedItems[0]!.fraction).toBe(1);
  });

  it('takes a fraction when item does not fit', () => {
    const result = fractionalKnapsack([{ weight: 10, value: 30 }], 5);
    expect(result.maxValue).toBe(15);
    expect(result.totalWeight).toBe(5);
    expect(result.packedItems[0]!.fraction).toBeCloseTo(0.5);
  });

  // ── Items with zero value ─────────────────────────────────────

  it('skips zero-value items in favor of valuable ones', () => {
    const items: FractionalKnapsackItem[] = [
      { weight: 10, value: 0 },
      { weight: 5, value: 50 },
    ];
    const result = fractionalKnapsack(items, 5);
    expect(result.maxValue).toBe(50);
    expect(result.packedItems.length).toBe(1);
    expect(result.packedItems[0]!.index).toBe(1);
  });

  // ── Larger example ────────────────────────────────────────────

  it('handles a larger set of items', () => {
    const items: FractionalKnapsackItem[] = [
      { weight: 1, value: 1 },
      { weight: 2, value: 6 },   // ratio 3 — best
      { weight: 3, value: 6 },   // ratio 2
      { weight: 5, value: 5 },   // ratio 1
      { weight: 4, value: 8 },   // ratio 2
    ];
    const result = fractionalKnapsack(items, 7);
    // Greedy order by ratio: item1 (3), item2 (2), item4 (2), item0 (1), item3 (1)
    // Take item1 fully (w=2, v=6), item2 fully (w=3, v=6), then 2/4 of item4 (w=2, v=4)
    expect(result.maxValue).toBe(16);
    expect(result.totalWeight).toBe(7);
  });

  // ── Does not mutate input ─────────────────────────────────────

  it('does not mutate the input array', () => {
    const items: FractionalKnapsackItem[] = [
      { weight: 30, value: 120 },
      { weight: 10, value: 60 },
      { weight: 20, value: 100 },
    ];
    const copy = items.map((i) => ({ ...i }));
    fractionalKnapsack(items, 50);
    expect(items).toEqual(copy);
  });

  // ── Property: packed weight never exceeds capacity ────────────

  it('never exceeds capacity', () => {
    const items: FractionalKnapsackItem[] = [
      { weight: 7, value: 42 },
      { weight: 3, value: 12 },
      { weight: 4, value: 40 },
      { weight: 5, value: 25 },
    ];
    const capacity = 10;
    const result = fractionalKnapsack(items, capacity);
    expect(result.totalWeight).toBeLessThanOrEqual(capacity);
    // Also verify from packedItems.
    const sumWeight = result.packedItems.reduce((s, p) => s + p.weight, 0);
    expect(sumWeight).toBeCloseTo(result.totalWeight);
  });
});
