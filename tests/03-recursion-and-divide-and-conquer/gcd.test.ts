import { describe, it, expect } from 'vitest';
import {
  gcd,
  gcdSlow,
} from '../../src/03-recursion-and-divide-and-conquer/gcd.js';

describe('gcd', () => {
  for (const func of [gcd, gcdSlow]) {
    describe(func.name, () => {
      it('should return the argument in case both arguments are equal', () => {
        expect(func(12, 12)).toBe(12);
      });

      it('should return the smallest number in case one number is divided by another', () => {
        expect(func(48, 24)).toBe(24);
      });

      it('should return 1 if the numbers are mutually prime', () => {
        expect(func(30, 77)).toBe(1);
      });

      it('should compute the greatest common divisor in case it is smaller than each of the numbers', () => {
        expect(func(210, 2618)).toBe(14);
      });
    });
  }
});
