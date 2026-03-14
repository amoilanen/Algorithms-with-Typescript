/**
 * Computes the greatest common divisor of two positive integers
 * by brute-force search from the smaller number downward.
 *
 * Time complexity: O(min(x, y))
 * Space complexity: O(1)
 */
export function gcdSlow(x: number, y: number): number {
  const min = Math.min(x, y);

  for (let i = min; i >= 2; i--) {
    if (x % i === 0 && y % i === 0) {
      return i;
    }
  }
  return 1;
}

/**
 * Computes the greatest common divisor of two positive integers
 * using the Euclidean algorithm.
 *
 * Time complexity: O(log(min(x, y)))
 * Space complexity: O(1)
 */
export function gcd(x: number, y: number): number {
  while (y > 0) {
    const r = x % y;
    x = y;
    y = r;
  }
  return x;
}
