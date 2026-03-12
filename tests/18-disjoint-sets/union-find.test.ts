import { describe, it, expect } from 'vitest';
import { UnionFind } from '../../src/18-disjoint-sets/union-find.js';

describe('UnionFind', () => {
  // ── makeSet & basic properties ──────────────────────────────────

  it('creates singleton sets', () => {
    const uf = new UnionFind<number>();
    uf.makeSet(1);
    uf.makeSet(2);
    uf.makeSet(3);

    expect(uf.size).toBe(3);
    expect(uf.componentCount).toBe(3);
  });

  it('makeSet is idempotent for existing elements', () => {
    const uf = new UnionFind<number>();
    uf.makeSet(1);
    uf.makeSet(1);
    uf.makeSet(1);

    expect(uf.size).toBe(1);
    expect(uf.componentCount).toBe(1);
  });

  it('works with string elements', () => {
    const uf = new UnionFind<string>();
    uf.makeSet('a');
    uf.makeSet('b');
    uf.makeSet('c');

    expect(uf.size).toBe(3);
    expect(uf.componentCount).toBe(3);
  });

  // ── find ──────────────────────────────────────────────────────

  it('find returns the element itself for a singleton set', () => {
    const uf = new UnionFind<number>();
    uf.makeSet(42);

    expect(uf.find(42)).toBe(42);
  });

  it('find throws for an element not in any set', () => {
    const uf = new UnionFind<number>();

    expect(() => uf.find(99)).toThrow('Element not found in any set');
  });

  // ── union ─────────────────────────────────────────────────────

  it('union merges two singleton sets', () => {
    const uf = new UnionFind<number>();
    uf.makeSet(1);
    uf.makeSet(2);

    const merged = uf.union(1, 2);

    expect(merged).toBe(true);
    expect(uf.componentCount).toBe(1);
    expect(uf.connected(1, 2)).toBe(true);
  });

  it('union returns false when elements are already in the same set', () => {
    const uf = new UnionFind<number>();
    uf.makeSet(1);
    uf.makeSet(2);
    uf.union(1, 2);

    expect(uf.union(1, 2)).toBe(false);
    expect(uf.componentCount).toBe(1);
  });

  it('union chains multiple sets together', () => {
    const uf = new UnionFind<number>();
    for (let i = 0; i < 5; i++) uf.makeSet(i);

    uf.union(0, 1);
    uf.union(2, 3);
    uf.union(0, 3);

    expect(uf.componentCount).toBe(2); // {0,1,2,3} and {4}
    expect(uf.connected(0, 2)).toBe(true);
    expect(uf.connected(1, 3)).toBe(true);
    expect(uf.connected(0, 4)).toBe(false);
  });

  it('union throws when an element is not in any set', () => {
    const uf = new UnionFind<number>();
    uf.makeSet(1);

    expect(() => uf.union(1, 2)).toThrow('Element not found in any set');
    expect(() => uf.union(3, 1)).toThrow('Element not found in any set');
  });

  // ── connected ─────────────────────────────────────────────────

  it('connected returns false for elements in different sets', () => {
    const uf = new UnionFind<number>();
    uf.makeSet(1);
    uf.makeSet(2);

    expect(uf.connected(1, 2)).toBe(false);
  });

  it('connected returns true for element with itself', () => {
    const uf = new UnionFind<number>();
    uf.makeSet(1);

    expect(uf.connected(1, 1)).toBe(true);
  });

  // ── path compression ──────────────────────────────────────────

  it('path compression flattens long chains', () => {
    const uf = new UnionFind<number>();
    // Build a chain: 0 <- 1 <- 2 <- 3 <- 4
    for (let i = 0; i < 10; i++) uf.makeSet(i);

    // Sequential unions to create a potentially deep structure.
    for (let i = 1; i < 10; i++) {
      uf.union(i - 1, i);
    }

    // All elements should share the same root.
    const root = uf.find(0);
    for (let i = 1; i < 10; i++) {
      expect(uf.find(i)).toBe(root);
    }

    expect(uf.componentCount).toBe(1);
  });

  // ── large input ───────────────────────────────────────────────

  it('handles a large number of elements efficiently', () => {
    const n = 10_000;
    const uf = new UnionFind<number>();
    for (let i = 0; i < n; i++) uf.makeSet(i);

    expect(uf.componentCount).toBe(n);

    // Merge all even elements into one component.
    for (let i = 2; i < n; i += 2) {
      uf.union(0, i);
    }
    // Merge all odd elements into another component.
    for (let i = 3; i < n; i += 2) {
      uf.union(1, i);
    }

    expect(uf.componentCount).toBe(2);
    expect(uf.connected(0, n - 2)).toBe(true);
    expect(uf.connected(1, n - 1)).toBe(true);
    expect(uf.connected(0, 1)).toBe(false);

    // Merge the two remaining components.
    uf.union(0, 1);
    expect(uf.componentCount).toBe(1);

    for (let i = 0; i < n; i++) {
      expect(uf.connected(0, i)).toBe(true);
    }
  });

  // ── multiple independent components ───────────────────────────

  it('tracks multiple independent components correctly', () => {
    const uf = new UnionFind<string>();
    const letters = 'abcdefghijkl'.split('');
    for (const l of letters) uf.makeSet(l);

    // Group 1: a-b-c-d
    uf.union('a', 'b');
    uf.union('c', 'd');
    uf.union('a', 'c');

    // Group 2: e-f-g
    uf.union('e', 'f');
    uf.union('f', 'g');

    // Group 3: h-i
    uf.union('h', 'i');

    // Singletons: j, k, l

    expect(uf.componentCount).toBe(6);

    expect(uf.connected('a', 'd')).toBe(true);
    expect(uf.connected('e', 'g')).toBe(true);
    expect(uf.connected('h', 'i')).toBe(true);

    expect(uf.connected('a', 'e')).toBe(false);
    expect(uf.connected('a', 'h')).toBe(false);
    expect(uf.connected('e', 'j')).toBe(false);
  });
});
