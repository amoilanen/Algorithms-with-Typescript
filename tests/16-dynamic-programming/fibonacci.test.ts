import { describe, it, expect } from 'vitest';
import {
  fibNaive,
  fibMemo,
  fibTabulated,
} from '../../src/16-dynamic-programming/fibonacci';

const KNOWN_FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];

describe('fibonacci', () => {
  for (const fib of [fibNaive, fibMemo, fibTabulated]) {
    describe(fib.name, () => {
      it('throws on negative input', () => {
        expect(() => fib(-1)).toThrow(RangeError);
        expect(() => fib(-100)).toThrow(RangeError);
      });

      it('returns 0 for n = 0', () => {
        expect(fib(0)).toBe(0);
      });

      it('returns 1 for n = 1', () => {
        expect(fib(1)).toBe(1);
      });

      it('returns correct values for n = 0..15', () => {
        for (let n = 0; n < KNOWN_FIB.length; n++) {
          expect(fib(n)).toBe(KNOWN_FIB[n]);
        }
      });
    });
  }

  describe('all implementations agree', () => {
    it('produces the same result for n = 0..20', () => {
      for (let n = 0; n <= 20; n++) {
        const expected = fibTabulated(n);
        expect(fibMemo(n)).toBe(expected);
        // Only test naive for small n due to exponential time.
        if (n <= 15) {
          expect(fibNaive(n)).toBe(expected);
        }
      }
    });
  });

  describe('fibMemo handles larger inputs', () => {
    it('computes fib(50) correctly', () => {
      expect(fibMemo(50)).toBe(12586269025);
    });
  });

  describe('fibTabulated handles larger inputs', () => {
    it('computes fib(50) correctly', () => {
      expect(fibTabulated(50)).toBe(12586269025);
    });

    it('computes fib(70) correctly', () => {
      expect(fibTabulated(70)).toBe(190392490709135);
    });
  });
});
