/**
 * Rabin-Karp string matching with a rolling polynomial hash.
 *
 * The algorithm computes a hash for the pattern and for each text window of
 * the same length, comparing hashes to identify candidate matches. When
 * hashes collide the algorithm falls back to a character-by-character
 * comparison to eliminate spurious hits.
 *
 * The rolling hash uses the recurrence:
 *
 *   h(s[i+1..i+m]) = ( d · ( h(s[i..i+m-1]) − s[i] · d^(m−1) ) + s[i+m] ) mod q
 *
 * where d is the alphabet size and q is a large prime.
 *
 * Time complexity:
 *   - Expected O(n + m) when hash collisions are rare.
 *   - Worst case O(n·m) if every window produces a collision (pathological input).
 * Space complexity: O(1) beyond the output array.
 *
 * @module
 */

/**
 * Find all occurrences of `pattern` in `text` using the Rabin-Karp algorithm.
 *
 * @param text    - The text to search in.
 * @param pattern - The pattern to search for.
 * @returns An array of starting indices (0-based) where `pattern` occurs in `text`.
 */
export function rabinKarp(text: string, pattern: string): number[] {
  const n = text.length;
  const m = pattern.length;
  const result: number[] = [];

  if (m === 0) return result;
  if (m > n) return result;

  // A large prime to reduce collisions.  Chosen so that d * q does not
  // overflow Number.MAX_SAFE_INTEGER (2^53 − 1).  With d = 256 and
  // q < 2^40 the products fit comfortably.
  const d = 256; // alphabet size (extended ASCII)
  const q = 1_000_000_007; // prime modulus

  // Precompute d^(m-1) mod q — the weight of the highest-order character
  let h = 1;
  for (let i = 0; i < m - 1; i++) {
    h = (h * d) % q;
  }

  // Initial hash values for the pattern and the first text window
  let patternHash = 0;
  let windowHash = 0;
  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * d + pattern.charCodeAt(i)) % q;
    windowHash = (windowHash * d + text.charCodeAt(i)) % q;
  }

  // Slide the pattern across the text
  for (let i = 0; i <= n - m; i++) {
    // When hashes match, verify character by character
    if (windowHash === patternHash) {
      let match = true;
      for (let j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        result.push(i);
      }
    }

    // Compute the hash for the next window by removing the leading character
    // and adding the trailing character
    if (i < n - m) {
      windowHash =
        ((windowHash - text.charCodeAt(i) * h) * d +
          text.charCodeAt(i + m)) %
        q;

      // JavaScript's % can return negative values; ensure non-negative
      if (windowHash < 0) {
        windowHash += q;
      }
    }
  }

  return result;
}
