/**
 * Computes the greatest common divisor of two positive integers
 * by brute-force search from the larger number downward.
 *
 * Time complexity: O(max(x, y))
 * Space complexity: O(1)
 */
export function gcdSlow(x: number, y: number): number {
  const max = Math.max(x, y);

  for (let i = max; i >= 2; i--) {
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
  let r = x % y;

  while (r > 0) {
    x = y;
    y = r;
    r = x % y;
  }
  return y;
}
