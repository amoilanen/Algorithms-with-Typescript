import { describe, it, expect } from 'vitest';
import { HashTableChaining } from '../../src/08-hash-tables/hash-table-chaining.js';

describe('HashTableChaining', () => {
  it('should start empty', () => {
    const ht = new HashTableChaining<string, number>();
    expect(ht.size).toBe(0);
    expect(ht.keys()).toEqual([]);
    expect(ht.values()).toEqual([]);
  });

  it('should set and get values', () => {
    const ht = new HashTableChaining<string, number>();
    ht.set('a', 1);
    ht.set('b', 2);
    ht.set('c', 3);
    expect(ht.get('a')).toBe(1);
    expect(ht.get('b')).toBe(2);
    expect(ht.get('c')).toBe(3);
    expect(ht.size).toBe(3);
  });

  it('should return undefined for non-existent keys', () => {
    const ht = new HashTableChaining<string, number>();
    expect(ht.get('missing')).toBeUndefined();
    ht.set('a', 1);
    expect(ht.get('b')).toBeUndefined();
  });

  it('should overwrite existing keys and return old value', () => {
    const ht = new HashTableChaining<string, number>();
    expect(ht.set('x', 10)).toBeUndefined(); // first insert
    expect(ht.set('x', 20)).toBe(10); // overwrite returns old
    expect(ht.get('x')).toBe(20);
    expect(ht.size).toBe(1); // size unchanged
  });

  it('should report has correctly', () => {
    const ht = new HashTableChaining<string, number>();
    expect(ht.has('a')).toBe(false);
    ht.set('a', 1);
    expect(ht.has('a')).toBe(true);
    expect(ht.has('b')).toBe(false);
  });

  it('should delete entries', () => {
    const ht = new HashTableChaining<string, number>();
    ht.set('a', 1);
    ht.set('b', 2);
    ht.set('c', 3);

    expect(ht.delete('b')).toBe(true);
    expect(ht.has('b')).toBe(false);
    expect(ht.get('b')).toBeUndefined();
    expect(ht.size).toBe(2);

    // Remaining keys still accessible
    expect(ht.get('a')).toBe(1);
    expect(ht.get('c')).toBe(3);
  });

  it('should return false when deleting non-existent key', () => {
    const ht = new HashTableChaining<string, number>();
    expect(ht.delete('missing')).toBe(false);
    ht.set('a', 1);
    expect(ht.delete('b')).toBe(false);
    expect(ht.size).toBe(1);
  });

  it('should handle many collisions gracefully', () => {
    // Small capacity forces many collisions
    const ht = new HashTableChaining<number, string>(2);
    for (let i = 0; i < 50; i++) {
      ht.set(i, `val${i}`);
    }
    expect(ht.size).toBe(50);
    for (let i = 0; i < 50; i++) {
      expect(ht.get(i)).toBe(`val${i}`);
    }
  });

  it('should resize automatically when load factor is exceeded', () => {
    const ht = new HashTableChaining<string, number>(4);
    const initialCapacity = ht.capacity;

    // Insert enough entries to trigger resize (load factor > 0.75)
    ht.set('a', 1);
    ht.set('b', 2);
    ht.set('c', 3);
    ht.set('d', 4);

    expect(ht.capacity).toBeGreaterThan(initialCapacity);
    // All values still accessible after resize
    expect(ht.get('a')).toBe(1);
    expect(ht.get('b')).toBe(2);
    expect(ht.get('c')).toBe(3);
    expect(ht.get('d')).toBe(4);
  });

  it('should clear all entries', () => {
    const ht = new HashTableChaining<string, number>();
    ht.set('a', 1);
    ht.set('b', 2);
    ht.clear();
    expect(ht.size).toBe(0);
    expect(ht.has('a')).toBe(false);
    expect(ht.has('b')).toBe(false);
  });

  it('should iterate over all entries', () => {
    const ht = new HashTableChaining<string, number>();
    ht.set('x', 10);
    ht.set('y', 20);
    ht.set('z', 30);

    const entries: [string, number][] = [];
    for (const entry of ht) {
      entries.push(entry);
    }

    expect(entries).toHaveLength(3);
    expect(entries).toContainEqual(['x', 10]);
    expect(entries).toContainEqual(['y', 20]);
    expect(entries).toContainEqual(['z', 30]);
  });

  it('should return keys and values arrays', () => {
    const ht = new HashTableChaining<string, number>();
    ht.set('a', 1);
    ht.set('b', 2);

    const keys = ht.keys();
    const values = ht.values();

    expect(keys).toHaveLength(2);
    expect(keys).toContain('a');
    expect(keys).toContain('b');

    expect(values).toHaveLength(2);
    expect(values).toContain(1);
    expect(values).toContain(2);
  });

  it('should handle number keys', () => {
    const ht = new HashTableChaining<number, string>();
    ht.set(1, 'one');
    ht.set(2, 'two');
    ht.set(42, 'forty-two');
    expect(ht.get(1)).toBe('one');
    expect(ht.get(2)).toBe('two');
    expect(ht.get(42)).toBe('forty-two');
  });

  it('should handle a single entry', () => {
    const ht = new HashTableChaining<string, number>();
    ht.set('only', 99);
    expect(ht.size).toBe(1);
    expect(ht.get('only')).toBe(99);
    expect(ht.has('only')).toBe(true);
    expect(ht.delete('only')).toBe(true);
    expect(ht.size).toBe(0);
    expect(ht.has('only')).toBe(false);
  });

  it('should handle empty table operations', () => {
    const ht = new HashTableChaining<string, number>();
    expect(ht.get('x')).toBeUndefined();
    expect(ht.has('x')).toBe(false);
    expect(ht.delete('x')).toBe(false);
    expect(ht.keys()).toEqual([]);
    expect(ht.values()).toEqual([]);
    expect([...ht]).toEqual([]);
  });

  it('should handle re-insertion after deletion', () => {
    const ht = new HashTableChaining<string, number>();
    ht.set('a', 1);
    ht.delete('a');
    ht.set('a', 2);
    expect(ht.get('a')).toBe(2);
    expect(ht.size).toBe(1);
  });

  it('should handle large number of insertions and deletions', () => {
    const ht = new HashTableChaining<number, number>();
    const n = 1000;

    for (let i = 0; i < n; i++) {
      ht.set(i, i * 10);
    }
    expect(ht.size).toBe(n);

    // Delete every other entry
    for (let i = 0; i < n; i += 2) {
      expect(ht.delete(i)).toBe(true);
    }
    expect(ht.size).toBe(n / 2);

    // Remaining entries accessible
    for (let i = 1; i < n; i += 2) {
      expect(ht.get(i)).toBe(i * 10);
    }
    // Deleted entries gone
    for (let i = 0; i < n; i += 2) {
      expect(ht.has(i)).toBe(false);
    }
  });

  it('should report correct load factor', () => {
    const ht = new HashTableChaining<string, number>(8);
    expect(ht.loadFactor).toBe(0);
    ht.set('a', 1);
    expect(ht.loadFactor).toBe(1 / 8);
    ht.set('b', 2);
    expect(ht.loadFactor).toBe(2 / 8);
  });

  it('should handle string values with special characters', () => {
    const ht = new HashTableChaining<string, string>();
    ht.set('emoji', '🚀');
    ht.set('unicode', 'café');
    ht.set('empty', '');
    expect(ht.get('emoji')).toBe('🚀');
    expect(ht.get('unicode')).toBe('café');
    expect(ht.get('empty')).toBe('');
  });
});
