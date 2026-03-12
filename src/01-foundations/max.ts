/**
 * Finds the maximum element in an array.
 * Returns undefined for an empty array.
 *
 * Time complexity: O(n)
 * Space complexity: O(1)
 */
export function max(elements: number[]): number | undefined {
  let result: number | undefined;

  for (const element of elements) {
    if (result === undefined || element > result) {
      result = element;
    }
  }
  return result;
}
