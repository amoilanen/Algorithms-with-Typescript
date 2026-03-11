import type { Comparator } from '../types.js';
import { numberComparator } from '../types.js';

/**
 * Sorts an array using the selection sort algorithm.
 * Returns a new sorted array; the input is not mutated.
 *
 * Time complexity: O(n²) in all cases
 * Space complexity: O(n) for the copy
 */
export function selectionSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);

  for (let i = 0; i < copy.length - 1; i++) {
    let remainingMinimum = copy[i]!;
    let indexToSwap = -1;

    for (let j = i + 1; j < copy.length; j++) {
      if (comparator(copy[j]!, remainingMinimum) < 0) {
        remainingMinimum = copy[j]!;
        indexToSwap = j;
      }
    }
    if (indexToSwap >= 0) {
      copy[indexToSwap] = copy[i]!;
      copy[i] = remainingMinimum;
    }
  }
  return copy;
}
