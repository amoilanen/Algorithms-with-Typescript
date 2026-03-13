import { describe, it, expect } from 'vitest';
import { editDistance } from '../../src/16-dynamic-programming/edit-distance';

describe('editDistance', () => {
  it('returns 0 for identical strings', () => {
    const result = editDistance('kitten', 'kitten');
    expect(result.distance).toBe(0);
    expect(result.operations.every((op) => op.op === 'match')).toBe(true);
  });

  it('returns length of b when a is empty', () => {
    const result = editDistance('', 'abc');
    expect(result.distance).toBe(3);
    expect(result.operations.every((op) => op.op === 'insert')).toBe(true);
  });

  it('returns length of a when b is empty', () => {
    const result = editDistance('abc', '');
    expect(result.distance).toBe(3);
    expect(result.operations.every((op) => op.op === 'delete')).toBe(true);
  });

  it('returns 0 for two empty strings', () => {
    const result = editDistance('', '');
    expect(result.distance).toBe(0);
    expect(result.operations).toEqual([]);
  });

  it('computes kitten → sitting = 3', () => {
    const result = editDistance('kitten', 'sitting');
    expect(result.distance).toBe(3);
  });

  it('computes saturday → sunday = 3', () => {
    const result = editDistance('saturday', 'sunday');
    expect(result.distance).toBe(3);
  });

  it('handles single character strings', () => {
    expect(editDistance('a', 'a').distance).toBe(0);
    expect(editDistance('a', 'b').distance).toBe(1);
    expect(editDistance('a', '').distance).toBe(1);
    expect(editDistance('', 'a').distance).toBe(1);
  });

  it('handles pure insertion', () => {
    const result = editDistance('abc', 'aXbYcZ');
    expect(result.distance).toBe(3);
  });

  it('handles pure deletion', () => {
    const result = editDistance('abcdef', 'ace');
    expect(result.distance).toBe(3);
  });

  it('operations produce a valid transformation', () => {
    const result = editDistance('intention', 'execution');
    expect(result.distance).toBe(5);

    // Verify the operations: apply them to the source and check we get the target.
    let built = '';
    let ai = 0;

    for (const step of result.operations) {
      switch (step.op) {
        case 'match':
          built += 'intention'[ai];
          ai++;
          break;
        case 'substitute':
          built += step.charB;
          ai++;
          break;
        case 'insert':
          built += step.charB;
          break;
        case 'delete':
          ai++;
          break;
      }
    }

    expect(built).toBe('execution');
  });

  it('edit operations count matches the distance', () => {
    const result = editDistance('algorithm', 'altruistic');
    const editCount = result.operations.filter(
      (op) => op.op !== 'match',
    ).length;
    expect(editCount).toBe(result.distance);
  });
});
