import { describe, it, expect } from 'vitest';
import { rabinKarp } from '../../src/20-string-matching/rabin-karp';

describe('rabinKarp', () => {
  // ── Basic matches ─────────────────────────────────────────────────

  it('finds a pattern at the start of the text', () => {
    expect(rabinKarp('abcdef', 'abc')).toEqual([0]);
  });

  it('finds a pattern in the middle of the text', () => {
    expect(rabinKarp('xyzabcxyz', 'abc')).toEqual([3]);
  });

  it('finds a pattern at the end of the text', () => {
    expect(rabinKarp('xyzabc', 'abc')).toEqual([3]);
  });

  it('finds a pattern that spans the entire text', () => {
    expect(rabinKarp('abc', 'abc')).toEqual([0]);
  });

  // ── Multiple occurrences ──────────────────────────────────────────

  it('finds multiple non-overlapping occurrences', () => {
    expect(rabinKarp('abcXXabc', 'abc')).toEqual([0, 5]);
  });

  it('finds overlapping occurrences', () => {
    expect(rabinKarp('aaaa', 'aa')).toEqual([0, 1, 2]);
  });

  it('finds overlapping occurrences in a longer pattern', () => {
    expect(rabinKarp('abababa', 'aba')).toEqual([0, 2, 4]);
  });

  // ── No match ──────────────────────────────────────────────────────

  it('returns empty array when pattern is not found', () => {
    expect(rabinKarp('hello world', 'xyz')).toEqual([]);
  });

  it('returns empty array when pattern is longer than text', () => {
    expect(rabinKarp('hi', 'hello')).toEqual([]);
  });

  // ── Edge cases ────────────────────────────────────────────────────

  it('returns empty array for an empty pattern', () => {
    expect(rabinKarp('hello', '')).toEqual([]);
  });

  it('returns empty array when both text and pattern are empty', () => {
    expect(rabinKarp('', '')).toEqual([]);
  });

  it('returns empty array when text is empty but pattern is not', () => {
    expect(rabinKarp('', 'a')).toEqual([]);
  });

  it('handles single-character text and pattern', () => {
    expect(rabinKarp('a', 'a')).toEqual([0]);
    expect(rabinKarp('a', 'b')).toEqual([]);
  });

  // ── Repeated characters ───────────────────────────────────────────

  it('handles text of repeated characters', () => {
    expect(rabinKarp('aaaaaaa', 'aaa')).toEqual([0, 1, 2, 3, 4]);
  });

  it('finds a single different character', () => {
    expect(rabinKarp('aabaa', 'b')).toEqual([2]);
  });

  // ── Hash collision resilience ─────────────────────────────────────

  it('correctly verifies matches despite potential hash collisions', () => {
    // Using strings that might produce similar hashes
    const text = 'abababababababababababababababab';
    const pattern = 'abab';
    const result = rabinKarp(text, pattern);
    // Verify each reported match is genuine
    for (const idx of result) {
      expect(text.substring(idx, idx + pattern.length)).toBe(pattern);
    }
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28]);
  });

  // ── Realistic examples ────────────────────────────────────────────

  it('finds a word in a sentence', () => {
    expect(rabinKarp('the quick brown fox', 'brown')).toEqual([10]);
  });

  it('finds repeated words in a sentence', () => {
    expect(rabinKarp('to be or not to be', 'to be')).toEqual([0, 13]);
  });

  // ── Larger input ──────────────────────────────────────────────────

  it('works correctly on a longer text', () => {
    const text = 'a'.repeat(10_000) + 'b' + 'a'.repeat(10_000);
    expect(rabinKarp(text, 'ab')).toEqual([9999]);
    expect(rabinKarp(text, 'ba')).toEqual([10000]);
  });
});
