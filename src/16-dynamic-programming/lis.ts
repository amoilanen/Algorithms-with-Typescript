/**
 * Longest Increasing Subsequence (LIS) via dynamic programming.
 *
 * Given a sequence of numbers, find the length of the longest strictly
 * increasing subsequence and recover the subsequence itself.
 *
 * Two approaches are provided:
 * 1. O(n²) classic DP.
 * 2. O(n log n) patience-sorting approach using binary search.
 *
 * @module
 */

/**
 * Result of the LIS computation.
 *
 * - `length`       — length of the longest increasing subsequence.
 * - `subsequence`  — one such longest increasing subsequence (recovered via
 *                    backtracking).
 */
export interface LISResult {
  length: number;
  subsequence: number[];
}

/**
 * Find the longest strictly increasing subsequence using O(n²) DP.
 *
 * `dp[i]` stores the length of the LIS ending at index `i`. For each
 * position, we check all earlier positions for extension.
 *
 * ### Complexity
 * - Time:  O(n²)
 * - Space: O(n)
 *
 * @param arr  Input array of numbers.
 * @returns A {@link LISResult} with the LIS length and the actual subsequence.
 */
export function lisDP(arr: readonly number[]): LISResult {
  const n = arr.length;
  if (n === 0) return { length: 0, subsequence: [] };

  const dp = new Array<number>(n).fill(1);
  const parent = new Array<number>(n).fill(-1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j]! < arr[i]! && dp[j]! + 1 > dp[i]!) {
        dp[i] = dp[j]! + 1;
        parent[i] = j;
      }
    }
  }

  // Find the index where the LIS ends.
  let bestLen = 0;
  let bestIdx = 0;
  for (let i = 0; i < n; i++) {
    if (dp[i]! > bestLen) {
      bestLen = dp[i]!;
      bestIdx = i;
    }
  }

  // Backtrack to recover the subsequence.
  const subsequence: number[] = [];
  let idx = bestIdx;
  while (idx !== -1) {
    subsequence.push(arr[idx]!);
    idx = parent[idx]!;
  }
  subsequence.reverse();

  return { length: bestLen, subsequence };
}

/**
 * Find the longest strictly increasing subsequence using the O(n log n)
 * patience-sorting approach.
 *
 * Maintains an array `tails` where `tails[i]` is the smallest tail element
 * of all increasing subsequences of length `i + 1`. For each element, we
 * use binary search to find where it fits.
 *
 * ### Complexity
 * - Time:  O(n log n)
 * - Space: O(n)
 *
 * @param arr  Input array of numbers.
 * @returns A {@link LISResult} with the LIS length and the actual subsequence.
 */
export function lisBinarySearch(arr: readonly number[]): LISResult {
  const n = arr.length;
  if (n === 0) return { length: 0, subsequence: [] };

  // tails[i] = smallest tail of all increasing subsequences of length i+1.
  const tails: number[] = [];
  // tailIndices[i] = index in arr of the element stored at tails[i].
  const tailIndices: number[] = [];
  // parent[i] = index of the previous element in the LIS ending at arr[i].
  const parent = new Array<number>(n).fill(-1);

  for (let i = 0; i < n; i++) {
    const val = arr[i]!;

    // Binary search for the leftmost position in tails where tails[pos] >= val.
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (tails[mid]! < val) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    tails[lo] = val;
    tailIndices[lo] = i;

    if (lo > 0) {
      parent[i] = tailIndices[lo - 1]!;
    }
  }

  // Backtrack to recover the subsequence.
  const length = tails.length;
  const subsequence: number[] = [];
  let idx = tailIndices[length - 1]!;
  for (let k = 0; k < length; k++) {
    subsequence.push(arr[idx]!);
    idx = parent[idx]!;
  }
  subsequence.reverse();

  return { length, subsequence };
}
