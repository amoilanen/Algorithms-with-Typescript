/**
 * Computes base^power by naive repeated multiplication.
 *
 * Time complexity: O(power)
 * Space complexity: O(1)
 */
export function powSlow(base: number, power: number): number {
  let result = 1;
  for (let i = 0; i < power; i++) {
    result = result * base;
  }
  return result;
}

/**
 * Computes base^power using exponentiation by squaring.
 *
 * Time complexity: O(log power)
 * Space complexity: O(1)
 */
export function pow(base: number, power: number): number {
  let result = 1;

  while (power > 0) {
    if (power % 2 === 0) {
      base = base * base;
      power = power / 2;
    } else {
      result = result * base;
      power = power - 1;
    }
  }
  return result;
}
