import { describe, it, expect } from 'vitest';
import {
  minCoinChange,
  countCoinChange,
} from '../../src/16-dynamic-programming/coin-change.js';

describe('minCoinChange', () => {
  it('throws on negative amount', () => {
    expect(() => minCoinChange([1, 5, 10], -1)).toThrow(RangeError);
  });

  it('returns 0 coins for amount 0', () => {
    const result = minCoinChange([1, 5, 10], 0);
    expect(result.minCoins).toBe(0);
    expect(result.coins).toEqual([]);
  });

  it('returns -1 when amount cannot be made', () => {
    const result = minCoinChange([3, 7], 5);
    expect(result.minCoins).toBe(-1);
    expect(result.coins).toEqual([]);
  });

  it('returns -1 for empty denominations with positive amount', () => {
    const result = minCoinChange([], 10);
    expect(result.minCoins).toBe(-1);
    expect(result.coins).toEqual([]);
  });

  it('uses a single denomination', () => {
    const result = minCoinChange([5], 15);
    expect(result.minCoins).toBe(3);
    expect(result.coins).toEqual([5, 5, 5]);
  });

  it('finds minimum coins for standard US denominations', () => {
    const result = minCoinChange([1, 5, 10, 25], 30);
    expect(result.minCoins).toBe(2);
    // coins should sum to 30 and use exactly 2 coins
    expect(result.coins.reduce((a, b) => a + b, 0)).toBe(30);
    expect(result.coins.length).toBe(2);
  });

  it('finds minimum coins: amount 11 with [1, 5, 6]', () => {
    const result = minCoinChange([1, 5, 6], 11);
    expect(result.minCoins).toBe(2);
    expect(result.coins.sort((a, b) => a - b)).toEqual([5, 6]);
  });

  it('coins sum to the target amount', () => {
    const result = minCoinChange([1, 3, 4], 6);
    expect(result.coins.reduce((a, b) => a + b, 0)).toBe(6);
    expect(result.minCoins).toBe(2); // 3 + 3
  });

  it('handles amount equal to a single coin', () => {
    const result = minCoinChange([1, 5, 10], 10);
    expect(result.minCoins).toBe(1);
    expect(result.coins).toEqual([10]);
  });
});

describe('countCoinChange', () => {
  it('throws on negative amount', () => {
    expect(() => countCoinChange([1, 5, 10], -1)).toThrow(RangeError);
  });

  it('returns 1 for amount 0', () => {
    expect(countCoinChange([1, 5, 10], 0)).toBe(1);
  });

  it('returns 0 when amount cannot be made', () => {
    expect(countCoinChange([3, 7], 5)).toBe(0);
  });

  it('returns 0 for empty denominations with positive amount', () => {
    expect(countCoinChange([], 10)).toBe(0);
  });

  it('counts ways with a single denomination', () => {
    // Only one way: 5+5+5
    expect(countCoinChange([5], 15)).toBe(1);
    // Impossible
    expect(countCoinChange([5], 7)).toBe(0);
  });

  it('counts ways for standard example', () => {
    // Amount 5 with coins [1, 2, 5]:
    // 1+1+1+1+1, 1+1+1+2, 1+2+2, 5 → 4 ways
    expect(countCoinChange([1, 2, 5], 5)).toBe(4);
  });

  it('counts ways for amount 4 with [1, 2, 3]', () => {
    // 1+1+1+1, 1+1+2, 2+2, 1+3 → 4 ways
    expect(countCoinChange([1, 2, 3], 4)).toBe(4);
  });

  it('counts ways for larger amount', () => {
    // Amount 10 with [2, 5, 3, 6]:
    // 2+2+2+2+2, 2+2+3+3, 2+2+6, 2+3+5, 5+5, 4×... let's verify computationally
    expect(countCoinChange([2, 5, 3, 6], 10)).toBe(5);
  });
});
