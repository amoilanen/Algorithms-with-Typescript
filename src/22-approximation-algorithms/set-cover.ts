/**
 * Greedy set cover approximation algorithm.
 *
 * Given a universe of elements and a collection of subsets whose union
 * is the universe, the **set cover** problem asks for the smallest
 * sub-collection of subsets that still covers every element. This is
 * NP-hard.
 *
 * The greedy algorithm repeatedly selects the subset that covers the most
 * uncovered elements. It achieves an approximation ratio of
 * $H(n) \leq \ln n + 1$, where $H(n)$ is the $n$-th harmonic number
 * and $n = |U|$ is the universe size.
 *
 * Time complexity:  O(|U| * |S| * max_set_size) in the worst case,
 *                   where |S| is the number of subsets.
 * Space complexity: O(|U| + |S| * max_set_size)
 *
 * @module
 */

/**
 * Result of the set cover computation.
 */
export interface SetCoverResult<T> {
  /** Indices of the selected subsets (from the input array). */
  selectedIndices: number[];
  /** The selected subsets. */
  selectedSets: ReadonlySet<T>[];
  /** Number of subsets selected. */
  count: number;
}

/**
 * Compute a greedy approximate set cover.
 *
 * At each step, the subset covering the most currently-uncovered elements
 * is selected. This continues until all elements are covered.
 *
 * ### Approximation ratio
 * The greedy algorithm produces a cover of size at most $H(\max_i |S_i|)$
 * times the optimal, where $H(k) = 1 + 1/2 + \cdots + 1/k \leq \ln k + 1$.
 *
 * ### Complexity
 * - Time:  O(|U| * |S| * max_set_size) worst case
 * - Space: O(|U| + total elements across all sets)
 *
 * @param universe  The universe of elements to cover.
 * @param subsets   A collection of subsets of the universe.
 * @returns A {@link SetCoverResult} with the selected subsets and indices.
 * @throws {Error} If the subsets do not cover the entire universe.
 */
export function setCover<T>(
  universe: ReadonlySet<T>,
  subsets: readonly ReadonlySet<T>[],
): SetCoverResult<T> {
  if (universe.size === 0) {
    return { selectedIndices: [], selectedSets: [], count: 0 };
  }

  const uncovered = new Set<T>(universe);
  const selectedIndices: number[] = [];
  const selectedSets: ReadonlySet<T>[] = [];
  const used = new Set<number>();

  while (uncovered.size > 0) {
    // Find the subset covering the most uncovered elements.
    let bestIndex = -1;
    let bestCount = 0;

    for (let i = 0; i < subsets.length; i++) {
      if (used.has(i)) continue;

      let count = 0;
      for (const elem of subsets[i]!) {
        if (uncovered.has(elem)) count++;
      }

      if (count > bestCount) {
        bestCount = count;
        bestIndex = i;
      }
    }

    if (bestIndex === -1 || bestCount === 0) {
      throw new Error(
        'Subsets do not cover the entire universe; ' +
          `${uncovered.size} element(s) remain uncovered`,
      );
    }

    // Select this subset.
    used.add(bestIndex);
    selectedIndices.push(bestIndex);
    selectedSets.push(subsets[bestIndex]!);

    // Remove newly covered elements.
    for (const elem of subsets[bestIndex]!) {
      uncovered.delete(elem);
    }
  }

  return { selectedIndices, selectedSets, count: selectedIndices.length };
}
