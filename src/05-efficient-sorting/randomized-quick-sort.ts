import type { Comparator } from '../types.js';
import { numberComparator } from '../types.js';

/**
 * Partitions arr[start..end] around a randomly chosen pivot.
 * Returns the final index of the pivot.
 */
function randomizedPartition<T>(
  arr: T[],
  start: number,
  end: number,
  comparator: Comparator<T>,
): number {
  // Choose a random pivot index in [start, end]
  const randomIndex = start + Math.floor(Math.random() * (end - start + 1));
  let storeIndex = start;

  // Move pivot to end
  const pivotTemp = arr[randomIndex]!;
  arr[randomIndex] = arr[end]!;
  arr[end] = pivotTemp;

  for (let i = start; i < end; i++) {
    if (comparator(arr[i]!, arr[end]!) < 0) {
      const temp = arr[storeIndex]!;
      arr[storeIndex] = arr[i]!;
      arr[i] = temp;
      storeIndex++;
    }
  }

  // Move pivot to its final position
  const temp = arr[storeIndex]!;
  arr[storeIndex] = arr[end]!;
  arr[end] = temp;

  return storeIndex;
}

function sort<T>(
  arr: T[],
  start: number,
  end: number,
  comparator: Comparator<T>,
): void {
  if (start < end) {
    const pivotIndex = randomizedPartition(arr, start, end, comparator);
    sort(arr, start, pivotIndex - 1, comparator);
    sort(arr, pivotIndex + 1, end, comparator);
  }
}

/**
 * Sorts an array using quicksort with random pivot selection.
 * Returns a new sorted array; the input is not mutated.
 *
 * The random pivot avoids worst-case O(n²) behavior on adversarial inputs,
 * giving an expected running time of O(n log n) for all inputs.
 *
 * Time complexity: O(n log n) expected, O(n²) worst case
 * Space complexity: O(n) for the copy + O(log n) expected recursion depth
 */
export function randomizedQuickSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const copy = elements.slice(0);

  sort(copy, 0, copy.length - 1, comparator);
  return copy;
}
