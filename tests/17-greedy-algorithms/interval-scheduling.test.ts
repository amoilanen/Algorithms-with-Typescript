import { describe, it, expect } from 'vitest';
import {
  intervalScheduling,
  type Interval,
} from '../../src/17-greedy-algorithms/interval-scheduling.js';

describe('intervalScheduling', () => {
  // ── Edge cases ────────────────────────────────────────────────

  it('returns empty result for no intervals', () => {
    const result = intervalScheduling([]);
    expect(result.selected).toEqual([]);
    expect(result.count).toBe(0);
  });

  it('selects the single interval when given one', () => {
    const result = intervalScheduling([{ start: 1, end: 4 }]);
    expect(result.count).toBe(1);
    expect(result.selected).toEqual([{ start: 1, end: 4 }]);
  });

  // ── Non-overlapping intervals ─────────────────────────────────

  it('selects all intervals when none overlap', () => {
    const intervals: Interval[] = [
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 4, end: 5 },
    ];
    const result = intervalScheduling(intervals);
    expect(result.count).toBe(3);
  });

  // ── Overlapping intervals ─────────────────────────────────────

  it('selects the maximum subset of non-overlapping intervals', () => {
    // Classic example: three overlapping intervals where the middle one
    // blocks both others.
    const intervals: Interval[] = [
      { start: 0, end: 6 },
      { start: 1, end: 4 },
      { start: 3, end: 5 },
      { start: 5, end: 7 },
      { start: 3, end: 9 },
      { start: 6, end: 10 },
      { start: 8, end: 11 },
    ];
    const result = intervalScheduling(intervals);
    // Optimal: [1,4], [5,7], [8,11]
    expect(result.count).toBe(3);
    // Verify all selected intervals are mutually non-overlapping.
    for (let i = 1; i < result.selected.length; i++) {
      expect(result.selected[i]!.start).toBeGreaterThanOrEqual(
        result.selected[i - 1]!.end,
      );
    }
  });

  it('handles the textbook activity-selection example', () => {
    // CLRS-style example.
    const intervals: Interval[] = [
      { start: 1, end: 4 },
      { start: 3, end: 5 },
      { start: 0, end: 6 },
      { start: 5, end: 7 },
      { start: 3, end: 9 },
      { start: 5, end: 9 },
      { start: 6, end: 10 },
      { start: 8, end: 11 },
      { start: 8, end: 12 },
      { start: 2, end: 14 },
      { start: 12, end: 16 },
    ];
    const result = intervalScheduling(intervals);
    expect(result.count).toBe(4);
    // Verify non-overlapping property.
    for (let i = 1; i < result.selected.length; i++) {
      expect(result.selected[i]!.start).toBeGreaterThanOrEqual(
        result.selected[i - 1]!.end,
      );
    }
  });

  it('handles intervals that share endpoints (touching is allowed)', () => {
    const intervals: Interval[] = [
      { start: 0, end: 1 },
      { start: 1, end: 2 },
      { start: 2, end: 3 },
    ];
    const result = intervalScheduling(intervals);
    // Touching intervals (start == previous end) are compatible.
    expect(result.count).toBe(3);
  });

  it('selects the short interval over the long one when they overlap', () => {
    const intervals: Interval[] = [
      { start: 0, end: 100 },
      { start: 0, end: 1 },
      { start: 1, end: 2 },
    ];
    const result = intervalScheduling(intervals);
    expect(result.count).toBe(2);
    expect(result.selected[0]).toEqual({ start: 0, end: 1 });
    expect(result.selected[1]).toEqual({ start: 1, end: 2 });
  });

  it('handles all intervals being identical', () => {
    const intervals: Interval[] = [
      { start: 0, end: 5 },
      { start: 0, end: 5 },
      { start: 0, end: 5 },
    ];
    const result = intervalScheduling(intervals);
    expect(result.count).toBe(1);
  });

  // ── Does not mutate input ─────────────────────────────────────

  it('does not mutate the input array', () => {
    const intervals: Interval[] = [
      { start: 3, end: 5 },
      { start: 1, end: 2 },
      { start: 0, end: 1 },
    ];
    const copy = intervals.map((i) => ({ ...i }));
    intervalScheduling(intervals);
    expect(intervals).toEqual(copy);
  });
});
