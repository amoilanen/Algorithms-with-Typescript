import type { Comparator } from '../types';
import { numberComparator } from '../types';

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
 * Sorts an array in place using the heap sort algorithm.
 *
 * Time complexity: O(n log n) in all cases
 * Space complexity: O(1)
 */
export function heapSort<T>(
  elements: T[],
  comparator: Comparator<T> = numberComparator as Comparator<T>,
): T[] {
  let heapSize = elements.length;

  buildHeap(elements, heapSize, comparator);
  for (let i = elements.length - 1; i > 0; i--) {
    const temp = elements[0]!;
    elements[0] = elements[i]!;
    elements[i] = temp;
    heapSize--;
    heapify(elements, heapSize, 0, comparator);
  }
  return elements;
}
