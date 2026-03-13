import { describe, it, expect } from 'vitest';
import { max } from '../../src/01-foundations/max';

describe('max', () => {
  it('should return maximum among several elements', () => {
    expect(max([2, 1, 4, 2, 3])).toBe(4);
  });

  it('should return single element for single element array', () => {
    expect(max([3])).toBe(3);
  });

  it('should return undefined when called with empty array', () => {
    expect(max([])).toBe(undefined);
  });
});
