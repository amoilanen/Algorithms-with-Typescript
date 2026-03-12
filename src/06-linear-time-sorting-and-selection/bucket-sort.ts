/**
 * Bucket sort for non-negative numbers.
 * Distributes elements into buckets, sorts each bucket with insertion sort,
 * then concatenates the results.
 *
 * Works best when input is uniformly distributed over a known range.
 * Returns a new sorted array; the input is not mutated.
 *
 * Time complexity: O(n) expected when input is uniformly distributed;
 *                  O(n²) worst case (all elements in one bucket)
 * Space complexity: O(n)
 */
export function bucketSort(elements: number[], bucketCount?: number): number[] {
  const n = elements.length;
  if (n <= 1) {
    return elements.slice(0);
  }

  const max = Math.max(...elements);
  const min = Math.min(...elements);

  // If all elements are the same, return a copy
  if (max === min) {
    return elements.slice(0);
  }

  const numBuckets = bucketCount ?? n;
  const range = max - min;

  // Create empty buckets
  const buckets: number[][] = [];
  for (let i = 0; i < numBuckets; i++) {
    buckets.push([]);
  }

  // Distribute elements into buckets
  for (const val of elements) {
    // Map value to bucket index [0, numBuckets - 1]
    let index = Math.floor(((val - min) / range) * (numBuckets - 1));
    if (index >= numBuckets) {
      index = numBuckets - 1;
    }
    buckets[index]!.push(val);
  }

  // Sort each bucket using insertion sort and concatenate
  const result: number[] = [];
  for (const bucket of buckets) {
    insertionSortInPlace(bucket);
    for (const val of bucket) {
      result.push(val);
    }
  }

  return result;
}

/**
 * In-place insertion sort used as a subroutine for bucket sort.
 * Efficient for small arrays (the expected bucket size).
 */
function insertionSortInPlace(arr: number[]): void {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]!;
    let j = i - 1;
    while (j >= 0 && arr[j]! > key) {
      arr[j + 1] = arr[j]!;
      j--;
    }
    arr[j + 1] = key;
  }
}
