import { insertionSortRange } from '../04-elementary-sorting/insertion-sort';
import { partition } from '../05-efficient-sorting/quick-sort';
import { numberComparator } from '../types';

/**
 * Deterministic linear-time selection using the median-of-medians algorithm
 * (also known as BFPRT, after Blum, Floyd, Pratt, Rivest, and Tarjan).
 *
 * Finds the k-th smallest element (0-indexed) with guaranteed O(n) worst case,
 * unlike randomized quickselect which is O(n) expected but O(n²) worst case.
 *
 * The algorithm:
 * 1. Divide the array into groups of 5
 * 2. Find the median of each group (by sorting each group)
 * 3. Recursively find the median of those medians
 * 4. Use this "median of medians" as pivot for partitioning
 * 5. Recurse into the appropriate partition
 *
 * Returns the k-th smallest element. The input array may be mutated.
 *
 * @param elements - The input array (will be partially reordered in place)
 * @param k - Zero-based index of the desired order statistic
 * @returns The k-th smallest element
 * @throws {RangeError} If k is out of bounds or array is empty
 *
 * Time complexity: O(n) worst case
 * Space complexity: O(log n) recursion stack
 */
export function medianOfMedians(elements: number[], k: number): number {
  if (elements.length === 0) {
    throw new RangeError('Cannot select from an empty array');
  }
  if (k < 0 || k >= elements.length) {
    throw new RangeError(
      `k=${k} is out of bounds for array of length ${elements.length}`,
    );
  }

  return selectMoM(elements, 0, elements.length - 1, k);
}

function selectMoM(
  arr: number[],
  left: number,
  right: number,
  k: number,
): number {
  // Base case: small enough to sort directly
  if (right - left < 5) {
    insertionSortRange(arr, left, right);
    return arr[k]!;
  }

  // Step 1: Divide into groups of 5, find median of each group
  const numGroups = Math.ceil((right - left + 1) / 5);
  for (let i = 0; i < numGroups; i++) {
    const groupLeft = left + i * 5;
    const groupRight = Math.min(groupLeft + 4, right);

    // Sort the group to find its median
    insertionSortRange(arr, groupLeft, groupRight);

    // Move the median of this group to the front of the array
    const medianIndex = groupLeft + Math.floor((groupRight - groupLeft) / 2);
    swap(arr, medianIndex, left + i);
  }

  // Step 2: Recursively find the median of the medians
  const medianOfMediansIndex = left + Math.floor((numGroups - 1) / 2);
  selectMoM(arr, left, left + numGroups - 1, medianOfMediansIndex);

  // The median of medians is now at medianOfMediansIndex
  // Step 3: Use Lomuto partition (from Chapter 5) with the chosen pivot
  const pivotIndex = partition(arr, left, right, numberComparator, medianOfMediansIndex)!;

  if (k === pivotIndex) {
    return arr[pivotIndex]!;
  } else if (k < pivotIndex) {
    return selectMoM(arr, left, pivotIndex - 1, k);
  } else {
    return selectMoM(arr, pivotIndex + 1, right, k);
  }
}

function swap(arr: number[], i: number, j: number): void {
  const tmp = arr[i]!;
  arr[i] = arr[j]!;
  arr[j] = tmp;
}
