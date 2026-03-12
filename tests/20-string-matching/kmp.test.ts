import { describe, it, expect } from 'vitest';
import { kmpSearch, computeFailure } from '../../src/20-string-matching/kmp.js';

describe('computeFailure', () => {
  it('returns empty array for empty pattern', () => {
    expect(computeFailure('')).toEqual([]);
  });

  it('returns [0] for a single character', () => {
    expect(computeFailure('a')).toEqual([0]);
  });

  it('returns all zeros when no prefix equals a suffix', () => {
    expect(computeFailure('abcdef')).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('computes failure function for "ababaca"', () => {
    // Classic CLRS example
    // a b a b a c a
    // 0 0 1 2 3 0 1
    expect(computeFailure('ababaca')).toEqual([0, 0, 1, 2, 3, 0, 1]);
  });

  it('computes failure function for "aabaaab"', () => {
    // a a b a a a b
    // 0 1 0 1 2 2 3
    expect(computeFailure('aabaaab')).toEqual([0, 1, 0, 1, 2, 2, 3]);
  });

  it('computes failure function for repeated characters', () => {
    // a a a a a
    // 0 1 2 3 4
    expect(computeFailure('aaaaa')).toEqual([0, 1, 2, 3, 4]);
  });

  it('computes failure function for "abcabd"', () => {
    // a b c a b d
    // 0 0 0 1 2 0
    expect(computeFailure('abcabd')).toEqual([0, 0, 0, 1, 2, 0]);
  });

  it('computes failure function for "abab"', () => {
    // a b a b
    // 0 0 1 2
    expect(computeFailure('abab')).toEqual([0, 0, 1, 2]);
  });
});

describe('kmpSearch', () => {
  // ── Basic matches ─────────────────────────────────────────────────

  it('finds a pattern at the start of the text', () => {
    expect(kmpSearch('abcdef', 'abc')).toEqual([0]);
  });

  it('finds a pattern in the middle of the text', () => {
    expect(kmpSearch('xyzabcxyz', 'abc')).toEqual([3]);
  });

  it('finds a pattern at the end of the text', () => {
    expect(kmpSearch('xyzabc', 'abc')).toEqual([3]);
  });

  it('finds a pattern that spans the entire text', () => {
    expect(kmpSearch('abc', 'abc')).toEqual([0]);
  });

  // ── Multiple occurrences ──────────────────────────────────────────

  it('finds multiple non-overlapping occurrences', () => {
    expect(kmpSearch('abcXXabc', 'abc')).toEqual([0, 5]);
  });

  it('finds overlapping occurrences', () => {
    expect(kmpSearch('aaaa', 'aa')).toEqual([0, 1, 2]);
  });

  it('finds overlapping occurrences in a longer pattern', () => {
    expect(kmpSearch('abababa', 'aba')).toEqual([0, 2, 4]);
  });

  // ── No match ──────────────────────────────────────────────────────

  it('returns empty array when pattern is not found', () => {
    expect(kmpSearch('hello world', 'xyz')).toEqual([]);
  });

  it('returns empty array when pattern is longer than text', () => {
    expect(kmpSearch('hi', 'hello')).toEqual([]);
  });

  // ── Edge cases ────────────────────────────────────────────────────

  it('returns empty array for an empty pattern', () => {
    expect(kmpSearch('hello', '')).toEqual([]);
  });

  it('returns empty array when both text and pattern are empty', () => {
    expect(kmpSearch('', '')).toEqual([]);
  });

  it('returns empty array when text is empty but pattern is not', () => {
    expect(kmpSearch('', 'a')).toEqual([]);
  });

  it('handles single-character text and pattern', () => {
    expect(kmpSearch('a', 'a')).toEqual([0]);
    expect(kmpSearch('a', 'b')).toEqual([]);
  });

  // ── Repeated characters ───────────────────────────────────────────

  it('handles text of repeated characters', () => {
    expect(kmpSearch('aaaaaaa', 'aaa')).toEqual([0, 1, 2, 3, 4]);
  });

  it('finds a single different character', () => {
    expect(kmpSearch('aabaa', 'b')).toEqual([2]);
  });

  // ── Patterns that exercise the failure function ───────────────────

  it('handles a pattern with repeating prefix-suffix structure', () => {
    // Pattern "abab" in "ababcababd" — the failure function matters at
    // the mismatch after "ababc"
    expect(kmpSearch('ababcababd', 'abab')).toEqual([0, 5]);
  });

  it('handles worst-case input for naive (but KMP is efficient)', () => {
    // a^(n-1) + b vs a^(m-1) + b: naive is O(nm) but KMP is O(n+m)
    const text = 'a'.repeat(1000) + 'b';
    const pattern = 'a'.repeat(100) + 'b';
    expect(kmpSearch(text, pattern)).toEqual([900]);
  });

  // ── Realistic examples ────────────────────────────────────────────

  it('finds a word in a sentence', () => {
    expect(kmpSearch('the quick brown fox', 'brown')).toEqual([10]);
  });

  it('finds repeated words in a sentence', () => {
    expect(kmpSearch('to be or not to be', 'to be')).toEqual([0, 13]);
  });

  // ── Larger input ──────────────────────────────────────────────────

  it('works correctly on a longer text', () => {
    const text = 'a'.repeat(10_000) + 'b' + 'a'.repeat(10_000);
    expect(kmpSearch(text, 'ab')).toEqual([9999]);
    expect(kmpSearch(text, 'ba')).toEqual([10000]);
  });

  // ── Cross-validation with other algorithms ────────────────────────

  it('produces the same results as naive search on various inputs', () => {
    const cases = [
      { text: 'abcabcabc', pattern: 'abc' },
      { text: 'aaaaaa', pattern: 'aa' },
      { text: 'abcdefgh', pattern: 'xyz' },
      { text: 'mississippi', pattern: 'issi' },
      { text: 'banana', pattern: 'ana' },
    ];

    for (const { text, pattern } of cases) {
      // Naive reference
      const expected: number[] = [];
      for (let i = 0; i <= text.length - pattern.length; i++) {
        if (text.substring(i, i + pattern.length) === pattern) {
          expected.push(i);
        }
      }
      expect(kmpSearch(text, pattern)).toEqual(expected);
    }
  });
});
