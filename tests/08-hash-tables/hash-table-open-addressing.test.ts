import { describe, it, expect } from 'vitest';
import {
  HashTableOpenAddressing,
  type ProbingStrategy,
} from '../../src/08-hash-tables/hash-table-open-addressing';

const strategies: ProbingStrategy[] = ['linear', 'double-hashing'];

for (const strategy of strategies) {
  describe(`HashTableOpenAddressing (${strategy})`, () => {
    it('should start empty', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      expect(ht.size).toBe(0);
      expect(ht.keys()).toEqual([]);
      expect(ht.values()).toEqual([]);
    });

    it('should set and get values', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      ht.set('a', 1);
      ht.set('b', 2);
      ht.set('c', 3);
      expect(ht.get('a')).toBe(1);
      expect(ht.get('b')).toBe(2);
      expect(ht.get('c')).toBe(3);
      expect(ht.size).toBe(3);
    });

    it('should return undefined for non-existent keys', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      expect(ht.get('missing')).toBeUndefined();
      ht.set('a', 1);
      expect(ht.get('b')).toBeUndefined();
    });

    it('should overwrite existing keys and return old value', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      expect(ht.set('x', 10)).toBeUndefined();
      expect(ht.set('x', 20)).toBe(10);
      expect(ht.get('x')).toBe(20);
      expect(ht.size).toBe(1);
    });

    it('should report has correctly', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      expect(ht.has('a')).toBe(false);
      ht.set('a', 1);
      expect(ht.has('a')).toBe(true);
      expect(ht.has('b')).toBe(false);
    });

    it('should delete entries', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      ht.set('a', 1);
      ht.set('b', 2);
      ht.set('c', 3);

      expect(ht.delete('b')).toBe(true);
      expect(ht.has('b')).toBe(false);
      expect(ht.get('b')).toBeUndefined();
      expect(ht.size).toBe(2);

      expect(ht.get('a')).toBe(1);
      expect(ht.get('c')).toBe(3);
    });

    it('should return false when deleting non-existent key', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      expect(ht.delete('missing')).toBe(false);
      ht.set('a', 1);
      expect(ht.delete('b')).toBe(false);
      expect(ht.size).toBe(1);
    });

    it('should handle many entries with automatic resizing', () => {
      const ht = new HashTableOpenAddressing<number, string>(4, strategy);
      for (let i = 0; i < 100; i++) {
        ht.set(i, `val${i}`);
      }
      expect(ht.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(ht.get(i)).toBe(`val${i}`);
      }
    });

    it('should resize automatically when load factor is exceeded', () => {
      const ht = new HashTableOpenAddressing<string, number>(4, strategy);
      const initialCapacity = ht.capacity;

      // Insert entries to trigger resize (load factor > 0.5 for open addressing)
      ht.set('a', 1);
      ht.set('b', 2);
      ht.set('c', 3);

      expect(ht.capacity).toBeGreaterThan(initialCapacity);
      expect(ht.get('a')).toBe(1);
      expect(ht.get('b')).toBe(2);
      expect(ht.get('c')).toBe(3);
    });

    it('should clear all entries', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      ht.set('a', 1);
      ht.set('b', 2);
      ht.clear();
      expect(ht.size).toBe(0);
      expect(ht.has('a')).toBe(false);
      expect(ht.has('b')).toBe(false);
    });

    it('should iterate over all entries', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
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
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
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

    it('should handle re-insertion after deletion', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      ht.set('a', 1);
      ht.delete('a');
      ht.set('a', 2);
      expect(ht.get('a')).toBe(2);
      expect(ht.size).toBe(1);
    });

    it('should handle tombstones correctly (deletion does not break probe chains)', () => {
      // Use small capacity to force collisions
      const ht = new HashTableOpenAddressing<number, string>(4, strategy);
      ht.set(0, 'zero');
      ht.set(1, 'one');
      ht.set(2, 'two');

      // Delete a middle element (creates tombstone)
      ht.delete(1);

      // Elements after the tombstone should still be findable
      expect(ht.get(0)).toBe('zero');
      expect(ht.get(2)).toBe('two');
      expect(ht.has(1)).toBe(false);
    });

    it('should handle large number of insertions and deletions', () => {
      const ht = new HashTableOpenAddressing<number, number>(16, strategy);
      const n = 500;

      for (let i = 0; i < n; i++) {
        ht.set(i, i * 10);
      }
      expect(ht.size).toBe(n);

      // Delete every other entry
      for (let i = 0; i < n; i += 2) {
        expect(ht.delete(i)).toBe(true);
      }
      expect(ht.size).toBe(n / 2);

      for (let i = 1; i < n; i += 2) {
        expect(ht.get(i)).toBe(i * 10);
      }
      for (let i = 0; i < n; i += 2) {
        expect(ht.has(i)).toBe(false);
      }
    });

    it('should handle number keys', () => {
      const ht = new HashTableOpenAddressing<number, string>(16, strategy);
      ht.set(1, 'one');
      ht.set(2, 'two');
      ht.set(42, 'forty-two');
      expect(ht.get(1)).toBe('one');
      expect(ht.get(2)).toBe('two');
      expect(ht.get(42)).toBe('forty-two');
    });

    it('should handle a single entry', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      ht.set('only', 99);
      expect(ht.size).toBe(1);
      expect(ht.get('only')).toBe(99);
      expect(ht.has('only')).toBe(true);
      expect(ht.delete('only')).toBe(true);
      expect(ht.size).toBe(0);
      expect(ht.has('only')).toBe(false);
    });

    it('should handle empty table operations', () => {
      const ht = new HashTableOpenAddressing<string, number>(16, strategy);
      expect(ht.get('x')).toBeUndefined();
      expect(ht.has('x')).toBe(false);
      expect(ht.delete('x')).toBe(false);
      expect(ht.keys()).toEqual([]);
      expect(ht.values()).toEqual([]);
      expect([...ht]).toEqual([]);
    });

    it('should report correct load factor', () => {
      const ht = new HashTableOpenAddressing<string, number>(8, strategy);
      expect(ht.loadFactor).toBe(0);
      ht.set('a', 1);
      // Capacity is rounded to power of 2, so 8
      expect(ht.loadFactor).toBe(1 / 8);
    });

    it('should handle repeated delete and re-insert cycles', () => {
      const ht = new HashTableOpenAddressing<string, number>(8, strategy);

      for (let cycle = 0; cycle < 10; cycle++) {
        ht.set('key', cycle);
        expect(ht.get('key')).toBe(cycle);
        ht.delete('key');
        expect(ht.has('key')).toBe(false);
      }

      expect(ht.size).toBe(0);
    });

    it('should handle string values with special characters', () => {
      const ht = new HashTableOpenAddressing<string, string>(16, strategy);
      ht.set('emoji', '🚀');
      ht.set('unicode', 'café');
      ht.set('empty', '');
      expect(ht.get('emoji')).toBe('🚀');
      expect(ht.get('unicode')).toBe('café');
      expect(ht.get('empty')).toBe('');
    });
  });
}
