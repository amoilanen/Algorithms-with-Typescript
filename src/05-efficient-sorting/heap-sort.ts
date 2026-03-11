import type { Comparator } from '../types.js';
import { numberComparator } from '../types.js';

function leftIndex(i: number): number {
  return 2 * i + 1;
}

function rightIndex(i: number): number {
  return 2 * i + 2;
}

function parentIndex(i: number): number {
  return Math.floor((i + 1) / 2) - 1;
}

function heapify<T>(
  arr: T[],
  heapSize: number,
  index: number,
  comparator: Comparator<T>,
): void {
  const left = leftIndex(index);
  const right = rightIndex(index);
  let indexOfMaximum = index;

  for (const subTreeRootIndex of [left, right]) {
    if (
      subTreeRootIndex < heapSize &&
      comparator(arr[subTreeRootIndex]!, arr[indexOfMaximum]!) > 0
    ) {
      indexOfMaximum = subTreeRootIndex;
    }
  }
  if (indexOfMaximum !== index) {
    const temp = arr[index]!;
    arr[index] = arr[indexOfMaximum]!;
    arr[indexOfMaximum] = temp;
    heapify(arr, heapSize, indexOfMaximum, comparator);
  }
}

function buildHeap<T>(
  arr: T[],
  heapSize: number,
  comparator: Comparator<T>,
): void {
  const lastNonLeafIndex = parentIndex(heapSize);

  for (let i = lastNonLeafIndex; i >= 0; i--) {
    heapify(arr, heapSize, i, comparator);
  }
}

/**
 * Sorts an array using the heap sort algorithm.
 * Returns a new sorted array; the input is not mutated.
 *
 * Time complexity: O(n log n) in all cases
 * Space complexity: O(n) for the copy
 */
export function heapSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  const arr = elements.slice(0);
  let heapSize = arr.length;

  buildHeap(arr, heapSize, comparator);
  for (let i = arr.length - 1; i > 0; i--) {
    const temp = arr[0]!;
    arr[0] = arr[i]!;
    arr[i] = temp;
    heapSize--;
    heapify(arr, heapSize, 0, comparator);
  }
  return arr;
}
