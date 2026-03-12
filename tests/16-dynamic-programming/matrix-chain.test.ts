import { describe, it, expect } from 'vitest';
import { matrixChainOrder } from '../../src/16-dynamic-programming/matrix-chain.js';

describe('matrixChainOrder', () => {
  it('throws if dims has fewer than 2 elements', () => {
    expect(() => matrixChainOrder([])).toThrow();
    expect(() => matrixChainOrder([5])).toThrow();
  });

  it('returns 0 for a single matrix', () => {
    // One matrix: 10×20 → no multiplications needed.
    const result = matrixChainOrder([10, 20]);
    expect(result.minCost).toBe(0);
    expect(result.parenthesization).toBe('A1');
  });

  it('computes cost for two matrices', () => {
    // A1: 10×30, A2: 30×5 → cost = 10×30×5 = 1500
    const result = matrixChainOrder([10, 30, 5]);
    expect(result.minCost).toBe(1500);
    expect(result.parenthesization).toBe('(A1A2)');
  });

  it('solves the CLRS standard example', () => {
    // CLRS example: dims = [30, 35, 15, 5, 10, 20, 25]
    // 6 matrices: A1(30×35), A2(35×15), A3(15×5), A4(5×10), A5(10×20), A6(20×25)
    // Optimal cost = 15125
    const result = matrixChainOrder([30, 35, 15, 5, 10, 20, 25]);
    expect(result.minCost).toBe(15125);
  });

  it('solves a three-matrix example', () => {
    // A1: 10×20, A2: 20×30, A3: 30×40
    // (A1·A2)·A3 = 10×20×30 + 10×30×40 = 6000 + 12000 = 18000
    // A1·(A2·A3) = 20×30×40 + 10×20×40 = 24000 + 8000 = 32000
    // Optimal: (A1·A2)·A3 = 18000
    const result = matrixChainOrder([10, 20, 30, 40]);
    expect(result.minCost).toBe(18000);
    expect(result.parenthesization).toBe('((A1A2)A3)');
  });

  it('handles square matrices', () => {
    // 3 matrices, each 5×5 → cost = 5×5×5 + 5×5×5 = 250
    const result = matrixChainOrder([5, 5, 5, 5]);
    expect(result.minCost).toBe(250);
  });

  it('parenthesization is well-formed', () => {
    const result = matrixChainOrder([40, 20, 30, 10, 30]);
    const parens = result.parenthesization;

    // Count parentheses: should be balanced.
    const opens = [...parens].filter((c) => c === '(').length;
    const closes = [...parens].filter((c) => c === ')').length;
    expect(opens).toBe(closes);

    // Should contain all matrix names A1..A4.
    for (let i = 1; i <= 4; i++) {
      expect(parens).toContain(`A${i}`);
    }
  });

  it('solves another standard example', () => {
    // dims = [5, 10, 3, 12, 5, 50, 6]
    // 6 matrices
    const result = matrixChainOrder([5, 10, 3, 12, 5, 50, 6]);
    // Verify cost is reasonable (should be 2010 for this instance).
    expect(result.minCost).toBe(2010);
  });
});
