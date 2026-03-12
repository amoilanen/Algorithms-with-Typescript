/**
 * Brute-force subset sum.
 *
 * Given a set of integers and a target sum, determine whether any subset
 * sums to exactly the target. This is a classic NP-complete problem
 * (reducible from 3-SAT). The brute-force approach enumerates all 2^n
 * subsets, making it feasible only for small inputs.
 *
 * Time complexity:  O(2^n · n) — enumerate all subsets, sum each.
 * Space complexity: O(n) for the recursion stack / subset tracking.
 *
 * @module
 */

/**
 * Result of the subset sum computation.
 */
export interface SubsetSumResult {
  /** Whether a valid subset was found. */
  found: boolean;
  /** The subset that sums to the target (empty if not found). */
  subset: number[];
}

/**
 * Determine whether any subset of `nums` sums to exactly `target`.
 *
 * Uses iterative bit-masking to enumerate all 2^n subsets. Returns the
 * first subset found (in order of increasing bitmask).
 *
 * @param nums   - The set of integers (may include negatives and duplicates).
 * @param target - The target sum.
 * @returns A {@link SubsetSumResult} indicating whether a subset was found
 *          and, if so, which elements comprise it.
 * @throws {RangeError} If `nums` has more than 30 elements (to prevent
 *         astronomically long runtimes).
 */
export function subsetSum(nums: readonly number[], target: number): SubsetSumResult {
  const n = nums.length;

  if (n > 30) {
    throw new RangeError(
      `input size ${n} is too large for brute-force enumeration (max 30)`,
    );
  }

  // Empty subset sums to 0.
  if (target === 0) {
    return { found: true, subset: [] };
  }

  const total = 1 << n; // 2^n

  for (let mask = 1; mask < total; mask++) {
    let sum = 0;
    const subset: number[] = [];

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += nums[i]!;
        subset.push(nums[i]!);
      }
    }

    if (sum === target) {
      return { found: true, subset };
    }
  }

  return { found: false, subset: [] };
}
