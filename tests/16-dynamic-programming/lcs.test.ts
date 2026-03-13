import { describe, it, expect } from 'vitest';
import { lcs, lcsString } from '../../src/16-dynamic-programming/lcs';

describe('lcs', () => {
  it('returns empty subsequence for empty arrays', () => {
    const result = lcs([], []);
    expect(result.length).toBe(0);
    expect(result.subsequence).toEqual([]);
  });

  it('returns empty subsequence when one array is empty', () => {
    expect(lcs([1, 2, 3], []).length).toBe(0);
    expect(lcs([], [1, 2, 3]).length).toBe(0);
  });

  it('returns the full array when both are identical', () => {
    const result = lcs([1, 2, 3], [1, 2, 3]);
    expect(result.length).toBe(3);
    expect(result.subsequence).toEqual([1, 2, 3]);
  });

  it('returns empty when arrays have no common elements', () => {
    const result = lcs([1, 3, 5], [2, 4, 6]);
    expect(result.length).toBe(0);
    expect(result.subsequence).toEqual([]);
  });

  it('handles the CLRS example', () => {
    // CLRS example: ABCBDAB and BDCABA → LCS = BCBA (length 4)
    const a = [...'ABCBDAB'];
    const b = [...'BDCABA'];
    const result = lcs(a, b);
    expect(result.length).toBe(4);
    // The recovered subsequence must actually be a common subsequence.
    expect(isSubsequence(result.subsequence, a)).toBe(true);
    expect(isSubsequence(result.subsequence, b)).toBe(true);
  });

  it('handles single-element arrays', () => {
    expect(lcs([1], [1]).length).toBe(1);
    expect(lcs([1], [2]).length).toBe(0);
  });

  it('handles arrays with duplicates', () => {
    const result = lcs([1, 1, 1], [1, 1]);
    expect(result.length).toBe(2);
    expect(result.subsequence).toEqual([1, 1]);
  });

  it('finds LCS of numeric sequences', () => {
    const result = lcs([1, 3, 4, 1, 2, 1, 3], [3, 4, 1, 2, 1, 3]);
    expect(result.length).toBe(6);
    expect(result.subsequence).toEqual([3, 4, 1, 2, 1, 3]);
  });
});

describe('lcsString', () => {
  it('returns empty for empty strings', () => {
    const result = lcsString('', '');
    expect(result.length).toBe(0);
    expect(result.subsequence).toEqual([]);
  });

  it('finds LCS of two strings', () => {
    const result = lcsString('ABCBDAB', 'BDCABA');
    expect(result.length).toBe(4);
    expect(isSubsequence(result.subsequence, [...'ABCBDAB'])).toBe(true);
    expect(isSubsequence(result.subsequence, [...'BDCABA'])).toBe(true);
  });

  it('returns full string when both are identical', () => {
    const result = lcsString('hello', 'hello');
    expect(result.length).toBe(5);
    expect(result.subsequence.join('')).toBe('hello');
  });

  it('handles completely different strings', () => {
    const result = lcsString('abc', 'xyz');
    expect(result.length).toBe(0);
  });

  it('handles one string being a subsequence of the other', () => {
    const result = lcsString('ace', 'abcde');
    expect(result.length).toBe(3);
    expect(result.subsequence.join('')).toBe('ace');
  });
});

/**
 * Helper: check if `sub` is a subsequence of `seq`.
 */
function isSubsequence<T>(sub: T[], seq: T[]): boolean {
  let si = 0;
  for (let i = 0; i < seq.length && si < sub.length; i++) {
    if (seq[i] === sub[si]) si++;
  }
  return si === sub.length;
}
