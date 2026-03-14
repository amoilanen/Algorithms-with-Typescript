/**
 * Linear search: finds the index of an element in an array.
 * Returns -1 if the element is not found.
 *
 * Time complexity: O(n)
 * Space complexity: O(1)
 */
export function linearSearch<T>(arr: T[], element: T): number {
  let position = -1;
  let currentIndex = 0;

  while (position < 0 && currentIndex < arr.length) {
    if (arr[currentIndex] === element) {
      position = currentIndex;
    } else {
      currentIndex++;
    }
  }
  return position;
}

/**
 * Recursive binary search: finds the index of an element in a sorted array.
 * Returns -1 if the element is not found.
 *
 * Time complexity: O(log n)
 * Space complexity: O(log n) due to recursive call stack
 */
export function binarySearchRecursive(
  arr: number[],
  element: number,
  low: number = 0,
  high: number = arr.length - 1,
): number {
  if (low > high) return -1; // base case: empty range

  const mid = Math.floor((low + high) / 2);
  const midVal = arr[mid]!;

  if (midVal === element) {
    return mid; // base case: found
  } else if (midVal < element) {
    return binarySearchRecursive(arr, element, mid + 1, high); // search right half
  } else {
    return binarySearchRecursive(arr, element, low, mid - 1); // search left half
  }
}

/**
 * Iterative binary search: finds the index of an element in a sorted array.
 * Returns -1 if the element is not found.
 *
 * Time complexity: O(log n)
 * Space complexity: O(1)
 */
export function binarySearch(arr: number[], element: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = arr[mid]!;

    if (midVal === element) {
      return mid;
    } else if (midVal < element) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}
