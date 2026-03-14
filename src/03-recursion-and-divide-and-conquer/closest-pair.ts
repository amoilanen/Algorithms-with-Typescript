/**
 * Closest pair of points — divide-and-conquer algorithm.
 *
 * Given a set of points in the plane, finds two points with the smallest
 * Euclidean distance between them.
 *
 * Time complexity:  O(n log² n)
 * Space complexity: O(n)
 */

/** A point in the 2D plane. */
export interface Point {
  x: number;
  y: number;
}

/** The result of a closest-pair query. */
export interface ClosestPairResult {
  p1: Point;
  p2: Point;
  distance: number;
}

/** Euclidean distance between two points. */
export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Finds the closest pair of points using the O(n log² n) divide-and-conquer
 * algorithm.
 *
 * The algorithm:
 * 1. Sort points by x-coordinate.
 * 2. Recursively find the closest pair in the left and right halves.
 * 3. Let δ = min(left distance, right distance).
 * 4. Build a "strip" of points within δ of the dividing line.
 * 5. Sort the strip by y-coordinate and check each point against
 *    at most 7 subsequent points (a geometric packing argument).
 * 6. Return the overall minimum.
 *
 * @param points - Array of at least 2 points.
 * @returns The closest pair and their distance.
 * @throws {Error} If fewer than 2 points are provided.
 */
export function closestPair(points: readonly Point[]): ClosestPairResult {
  if (points.length < 2) {
    throw new Error('At least 2 points are required');
  }

  // Sort by x-coordinate; tie-break on y for a deterministic order
  // among points with equal x (not required for correctness)
  const sortedByX = [...points].sort(
    (a, b) => a.x - b.x || a.y - b.y,
  );

  return closestPairRec(sortedByX);
}

/**
 * Brute-force closest pair for small inputs (≤ 3 points).
 */
export function bruteForce(points: readonly Point[]): ClosestPairResult {
  let best: ClosestPairResult = {
    p1: points[0]!,
    p2: points[1]!,
    distance: distance(points[0]!, points[1]!),
  };

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = distance(points[i]!, points[j]!);
      if (d < best.distance) {
        best = { p1: points[i]!, p2: points[j]!, distance: d };
      }
    }
  }
  return best;
}

/**
 * Recursive divide-and-conquer implementation.
 * Assumes `pts` is sorted by x-coordinate.
 */
function closestPairRec(points: readonly Point[]): ClosestPairResult {
  // Base case: use brute force for small inputs
  if (points.length <= 3) {
    return bruteForce(points);
  }

  const mid = Math.floor(points.length / 2);
  const midPoint = points[mid]!;

  const left = points.slice(0, mid);
  const right = points.slice(mid);

  const leftResult = closestPairRec(left);
  const rightResult = closestPairRec(right);

  let best =
    leftResult.distance <= rightResult.distance ? leftResult : rightResult;
  const delta = best.distance;

  // Build the strip: points within delta of the dividing x-coordinate
  const strip: Point[] = [];
  for (const p of points) {
    if (Math.abs(p.x - midPoint.x) < delta) {
      strip.push(p);
    }
  }

  // Sort strip by y-coordinate
  strip.sort((a, b) => a.y - b.y);

  // Check each point against at most 7 subsequent points in the strip
  for (let i = 0; i < strip.length; i++) {
    for (let j = i + 1; j < strip.length; j++) {
      const dy = strip[j]!.y - strip[i]!.y;
      if (dy >= best.distance) {
        break;
      }
      const d = distance(strip[i]!, strip[j]!);
      if (d < best.distance) {
        best = { p1: strip[i]!, p2: strip[j]!, distance: d };
      }
    }
  }

  return best;
}
