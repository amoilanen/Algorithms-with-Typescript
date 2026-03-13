import { describe, it, expect } from 'vitest';
import {
  pow,
  powSlow,
} from '../../src/03-recursion-and-divide-and-conquer/pow';

describe('pow', () => {
  for (const func of [powSlow, pow]) {
    describe(func.name, () => {
      it('should keep 1 unchanged', () => {
        expect(func(1, 4)).toBe(1);
      });

      it('should be 1 when the power is 0', () => {
        expect(func(3, 0)).toBe(1);
      });

      it('should compute the odd power', () => {
        expect(func(5, 3)).toBe(125);
      });

      it('should compute the even power', () => {
        expect(func(2, 10)).toBe(1024);
      });
    });
  }
});
