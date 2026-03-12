import { describe, it, expect } from 'vitest';
import {
  primesUpTo,
  primesUpToSlow,
} from '../../src/01-foundations/sieve-of-eratosthenes.js';

describe('sieve of eratosthenes', () => {
  for (const func of [primesUpToSlow, primesUpTo]) {
    describe(func.name, () => {
      it('should return no numbers for 1', () => {
        expect(func(1)).toEqual([]);
      });

      it('should return only 2 for 2', () => {
        expect(func(2)).toEqual([2]);
      });

      it('should return all prime numbers before n > 2, n is not prime', () => {
        expect(func(15)).toEqual([2, 3, 5, 7, 11, 13]);
      });

      it('should return all prime numbers before n > 2, n is prime', () => {
        expect(func(5)).toEqual([2, 3, 5]);
      });
    });
  }
});
