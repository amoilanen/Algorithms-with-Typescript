import { describe, it, expect } from 'vitest';
import { naiveMatch } from '../../src/20-string-matching/naive-matching';

describe('naiveMatch', () => {
  // ── Basic matches ─────────────────────────────────────────────────

  it('finds a pattern at the start of the text', () => {
    expect(naiveMatch('abcdef', 'abc')).toEqual([0]);
  });

  it('finds a pattern in the middle of the text', () => {
    expect(naiveMatch('xyzabcxyz', 'abc')).toEqual([3]);
  });

  it('finds a pattern at the end of the text', () => {
    expect(naiveMatch('xyzabc', 'abc')).toEqual([3]);
  });

  it('finds a pattern that spans the entire text', () => {
    expect(naiveMatch('abc', 'abc')).toEqual([0]);
  });

  // ── Multiple occurrences ──────────────────────────────────────────

  it('finds multiple non-overlapping occurrences', () => {
    expect(naiveMatch('abcXXabc', 'abc')).toEqual([0, 5]);
  });

  it('finds overlapping occurrences', () => {
    expect(naiveMatch('aaaa', 'aa')).toEqual([0, 1, 2]);
  });

  it('finds overlapping occurrences in a longer pattern', () => {
    expect(naiveMatch('abababa', 'aba')).toEqual([0, 2, 4]);
  });

  // ── No match ──────────────────────────────────────────────────────

  it('returns empty array when pattern is not found', () => {
    expect(naiveMatch('hello world', 'xyz')).toEqual([]);
  });

  it('returns empty array when pattern is longer than text', () => {
    expect(naiveMatch('hi', 'hello')).toEqual([]);
  });

  // ── Edge cases ────────────────────────────────────────────────────

  it('returns empty array for an empty pattern', () => {
    expect(naiveMatch('hello', '')).toEqual([]);
  });

  it('returns empty array when both text and pattern are empty', () => {
    expect(naiveMatch('', '')).toEqual([]);
  });

  it('returns empty array when text is empty but pattern is not', () => {
    expect(naiveMatch('', 'a')).toEqual([]);
  });

  it('handles single-character text and pattern', () => {
    expect(naiveMatch('a', 'a')).toEqual([0]);
    expect(naiveMatch('a', 'b')).toEqual([]);
  });

  // ── Repeated characters ───────────────────────────────────────────

  it('handles text of repeated characters', () => {
    expect(naiveMatch('aaaaaaa', 'aaa')).toEqual([0, 1, 2, 3, 4]);
  });

  it('finds a single different character', () => {
    expect(naiveMatch('aabaa', 'b')).toEqual([2]);
  });

  // ── Realistic examples ────────────────────────────────────────────

  it('finds a word in a sentence', () => {
    expect(naiveMatch('the quick brown fox', 'brown')).toEqual([10]);
  });

  it('finds repeated words in a sentence', () => {
    expect(naiveMatch('to be or not to be', 'to be')).toEqual([0, 13]);
  });
});
