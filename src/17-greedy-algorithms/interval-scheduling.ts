/**
 * Interval scheduling maximization (activity selection) via the greedy
 * strategy: always pick the interval that finishes earliest.
 *
 * @module
 */

/**
 * An interval (activity) with a start and end time.
 */
export interface Interval {
  start: number;
  end: number;
}

/**
 * Result of the interval scheduling computation.
 *
 * - `selected` — the maximum-size subset of mutually compatible intervals,
 *   in order of increasing finish time.
 * - `count`    — the number of selected intervals.
 */
export interface IntervalSchedulingResult {
  selected: Interval[];
  count: number;
}

/**
 * Select the maximum number of mutually non-overlapping intervals.
 *
 * The greedy strategy sorts intervals by finish time and greedily picks
 * each interval whose start time is at least as large as the finish time
 * of the previously selected interval.
 *
 * ### Complexity
 * - Time:  O(n log n) — dominated by sorting
 * - Space: O(n) — for the sorted copy and result
 *
 * @param intervals  An array of intervals. Not mutated.
 * @returns An {@link IntervalSchedulingResult} with the selected intervals
 *          and their count.
 */
export function intervalScheduling(
  intervals: readonly Interval[],
): IntervalSchedulingResult {
  if (intervals.length === 0) {
    return { selected: [], count: 0 };
  }

  // Sort by finish time (break ties by start time).
  const sorted = intervals.slice().sort((a, b) => {
    if (a.end !== b.end) return a.end - b.end;
    return a.start - b.start;
  });

  const selected: Interval[] = [sorted[0]!];
  let lastEnd = sorted[0]!.end;

  for (let i = 1; i < sorted.length; i++) {
    const interval = sorted[i]!;
    if (interval.start >= lastEnd) {
      selected.push(interval);
      lastEnd = interval.end;
    }
  }

  return { selected, count: selected.length };
}
