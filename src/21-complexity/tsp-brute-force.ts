/**
 * Brute-force Traveling Salesman Problem (TSP).
 *
 * Given a complete weighted graph of n cities, find the Hamiltonian cycle
 * (tour visiting every city exactly once and returning to the start) with
 * the minimum total distance.
 *
 * The brute-force approach generates all (n-1)! permutations of cities
 * (fixing the starting city to avoid counting rotations). This is feasible
 * only for very small n (roughly n ≤ 12).
 *
 * Time complexity:  O(n!) — (n-1)! permutations, each costing O(n) to evaluate.
 * Space complexity: O(n) for the current permutation and best tour.
 *
 * @module
 */

/**
 * A distance matrix where `dist[i][j]` is the cost of traveling from city i
 * to city j. The matrix need not be symmetric (asymmetric TSP is supported).
 */
export type DistanceMatrix = readonly (readonly number[])[];

/**
 * Result of the TSP computation.
 */
export interface TSPResult {
  /** The optimal tour as an ordered list of city indices (starting city appears
   *  at the beginning but NOT repeated at the end). */
  tour: number[];
  /** The total distance of the optimal tour (including return to start). */
  distance: number;
}

/**
 * Solve the TSP by brute-force enumeration of all permutations.
 *
 * Fixes city 0 as the starting point and generates all (n-1)! permutations
 * of the remaining cities using Heap's algorithm.
 *
 * @param dist - An n×n distance matrix. `dist[i][j]` is the cost from city i to city j.
 * @returns A {@link TSPResult} with the optimal tour and its total distance.
 * @throws {RangeError} If the matrix is empty or has more than 12 cities.
 * @throws {Error} If the matrix is not square.
 */
export function tspBruteForce(dist: DistanceMatrix): TSPResult {
  const n = dist.length;

  if (n === 0) {
    throw new RangeError('distance matrix must not be empty');
  }

  for (let i = 0; i < n; i++) {
    if (dist[i]!.length !== n) {
      throw new Error(`distance matrix must be square (row ${i} has ${dist[i]!.length} columns, expected ${n})`);
    }
  }

  if (n > 12) {
    throw new RangeError(
      `input size ${n} is too large for brute-force TSP (max 12)`,
    );
  }

  // Single city: trivial tour.
  if (n === 1) {
    return { tour: [0], distance: 0 };
  }

  // Two cities: only one tour.
  if (n === 2) {
    return {
      tour: [0, 1],
      distance: dist[0]![1]! + dist[1]![0]!,
    };
  }

  // Fix city 0 as start; permute the remaining cities.
  const remaining = Array.from({ length: n - 1 }, (_, i) => i + 1);

  let bestDistance = Infinity;
  let bestTour: number[] = [];

  /**
   * Evaluate the cost of the tour: 0 → remaining[0] → ... → remaining[k-1] → 0.
   */
  function tourCost(perm: number[]): number {
    let cost = dist[0]![perm[0]!]!;
    for (let i = 0; i < perm.length - 1; i++) {
      cost += dist[perm[i]!]![perm[i + 1]!]!;
    }
    cost += dist[perm[perm.length - 1]!]![0]!;
    return cost;
  }

  /**
   * Generate all permutations using Heap's algorithm and evaluate each.
   */
  function heapPermute(arr: number[], size: number): void {
    if (size === 1) {
      const cost = tourCost(arr);
      if (cost < bestDistance) {
        bestDistance = cost;
        bestTour = [0, ...arr];
      }
      return;
    }

    for (let i = 0; i < size; i++) {
      heapPermute(arr, size - 1);
      // Swap: if size is even, swap i-th with last; if odd, swap first with last.
      const swapIdx = size % 2 === 0 ? i : 0;
      const temp = arr[swapIdx]!;
      arr[swapIdx] = arr[size - 1]!;
      arr[size - 1] = temp;
    }
  }

  heapPermute(remaining, remaining.length);

  return { tour: bestTour, distance: bestDistance };
}
