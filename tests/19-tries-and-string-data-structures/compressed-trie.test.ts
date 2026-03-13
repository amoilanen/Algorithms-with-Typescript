import { describe, it, expect } from 'vitest';
import { CompressedTrie } from '../../src/19-tries-and-string-data-structures/compressed-trie';

describe('CompressedTrie', () => {
  // ── Construction and empty state ──────────────────────────────────

  describe('empty trie', () => {
    it('has size 0', () => {
      const t = new CompressedTrie();
      expect(t.size).toBe(0);
    });

    it('is empty', () => {
      const t = new CompressedTrie();
      expect(t.isEmpty).toBe(true);
    });

    it('search returns false for any word', () => {
      const t = new CompressedTrie();
      expect(t.search('hello')).toBe(false);
      expect(t.search('')).toBe(false);
    });

    it('startsWith returns false', () => {
      const t = new CompressedTrie();
      expect(t.startsWith('a')).toBe(false);
    });

    it('autocomplete returns empty array', () => {
      const t = new CompressedTrie();
      expect(t.autocomplete('a')).toEqual([]);
    });

    it('allWords returns empty array', () => {
      const t = new CompressedTrie();
      expect(t.allWords()).toEqual([]);
    });

    it('delete returns false', () => {
      const t = new CompressedTrie();
      expect(t.delete('hello')).toBe(false);
    });
  });

  // ── Insert and search ─────────────────────────────────────────────

  describe('insert and search', () => {
    it('inserts and finds a single word', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      expect(t.search('hello')).toBe(true);
      expect(t.size).toBe(1);
    });

    it('does not find a prefix that is not a complete word', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      expect(t.search('hell')).toBe(false);
      expect(t.search('hel')).toBe(false);
      expect(t.search('he')).toBe(false);
      expect(t.search('h')).toBe(false);
    });

    it('does not find a word that extends beyond stored words', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      expect(t.search('helloo')).toBe(false);
      expect(t.search('helloworld')).toBe(false);
    });

    it('inserts multiple words with shared prefixes', () => {
      const t = new CompressedTrie();
      t.insert('apple');
      t.insert('app');
      t.insert('application');
      expect(t.search('apple')).toBe(true);
      expect(t.search('app')).toBe(true);
      expect(t.search('application')).toBe(true);
      expect(t.search('ap')).toBe(false);
      expect(t.size).toBe(3);
    });

    it('inserts words with no shared prefixes', () => {
      const t = new CompressedTrie();
      t.insert('cat');
      t.insert('dog');
      t.insert('fish');
      expect(t.search('cat')).toBe(true);
      expect(t.search('dog')).toBe(true);
      expect(t.search('fish')).toBe(true);
      expect(t.size).toBe(3);
    });

    it('handles single-character words', () => {
      const t = new CompressedTrie();
      t.insert('a');
      t.insert('b');
      expect(t.search('a')).toBe(true);
      expect(t.search('b')).toBe(true);
      expect(t.search('c')).toBe(false);
      expect(t.size).toBe(2);
    });

    it('handles empty string insertion', () => {
      const t = new CompressedTrie();
      t.insert('');
      expect(t.search('')).toBe(true);
      expect(t.size).toBe(1);
    });

    it('duplicate insertion is a no-op', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      t.insert('hello');
      expect(t.size).toBe(1);
      expect(t.search('hello')).toBe(true);
    });

    it('handles insertion order that causes splits', () => {
      const t = new CompressedTrie();
      // Insert "romane" first — creates a single node with label "romane"
      t.insert('romane');
      // Insert "romanus" — shares "roman", forces a split
      t.insert('romanus');
      // Insert "rom" — splits at "rom"
      t.insert('rom');

      expect(t.search('romane')).toBe(true);
      expect(t.search('romanus')).toBe(true);
      expect(t.search('rom')).toBe(true);
      expect(t.search('roman')).toBe(false);
      expect(t.size).toBe(3);
    });

    it('handles the classic radix tree example', () => {
      const t = new CompressedTrie();
      const words = ['romane', 'romanus', 'romulus', 'rubens', 'ruber', 'rubicon', 'rubicundus'];
      for (const w of words) t.insert(w);

      for (const w of words) {
        expect(t.search(w)).toBe(true);
      }
      expect(t.size).toBe(7);
      expect(t.search('rom')).toBe(false);
      expect(t.search('rub')).toBe(false);
    });
  });

  // ── startsWith ────────────────────────────────────────────────────

  describe('startsWith', () => {
    it('returns true for valid prefixes', () => {
      const t = new CompressedTrie();
      t.insert('apple');
      t.insert('application');
      expect(t.startsWith('app')).toBe(true);
      expect(t.startsWith('appl')).toBe(true);
      expect(t.startsWith('apple')).toBe(true);
      expect(t.startsWith('a')).toBe(true);
    });

    it('returns false for non-existent prefixes', () => {
      const t = new CompressedTrie();
      t.insert('apple');
      expect(t.startsWith('b')).toBe(false);
      expect(t.startsWith('apx')).toBe(false);
      expect(t.startsWith('applez')).toBe(false);
    });

    it('returns true for prefix that ends in the middle of an edge label', () => {
      const t = new CompressedTrie();
      t.insert('testing');
      // "test" is a prefix of "testing" but ends in the middle of the label
      expect(t.startsWith('test')).toBe(true);
      expect(t.startsWith('tes')).toBe(true);
      expect(t.startsWith('te')).toBe(true);
    });

    it('returns true for empty prefix when trie is non-empty', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      expect(t.startsWith('')).toBe(true);
    });
  });

  // ── Delete ────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a word and confirms it is gone', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      expect(t.delete('hello')).toBe(true);
      expect(t.search('hello')).toBe(false);
      expect(t.size).toBe(0);
      expect(t.isEmpty).toBe(true);
    });

    it('returns false when deleting a non-existent word', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      expect(t.delete('world')).toBe(false);
      expect(t.size).toBe(1);
    });

    it('does not affect other words when deleting', () => {
      const t = new CompressedTrie();
      t.insert('apple');
      t.insert('app');
      t.insert('application');
      expect(t.delete('app')).toBe(true);
      expect(t.search('app')).toBe(false);
      expect(t.search('apple')).toBe(true);
      expect(t.search('application')).toBe(true);
      expect(t.size).toBe(2);
    });

    it('deletes a word that is a prefix of another', () => {
      const t = new CompressedTrie();
      t.insert('he');
      t.insert('hello');
      expect(t.delete('he')).toBe(true);
      expect(t.search('he')).toBe(false);
      expect(t.search('hello')).toBe(true);
    });

    it('deletes a word that has another word as prefix', () => {
      const t = new CompressedTrie();
      t.insert('he');
      t.insert('hello');
      expect(t.delete('hello')).toBe(true);
      expect(t.search('hello')).toBe(false);
      expect(t.search('he')).toBe(true);
    });

    it('merges nodes after deletion to maintain compression', () => {
      const t = new CompressedTrie();
      t.insert('abc');
      t.insert('abd');
      t.insert('abcd');

      const nodesBefore = t.nodeCount();

      t.delete('abcd');
      // After deletion, the 'c' and 'd' branches under 'ab' should still exist
      expect(t.search('abc')).toBe(true);
      expect(t.search('abd')).toBe(true);

      // The node for 'abc' + 'd' should be removed, reducing node count
      expect(t.nodeCount()).toBeLessThanOrEqual(nodesBefore);
    });

    it('deletes the empty string', () => {
      const t = new CompressedTrie();
      t.insert('');
      t.insert('a');
      expect(t.delete('')).toBe(true);
      expect(t.search('')).toBe(false);
      expect(t.search('a')).toBe(true);
      expect(t.size).toBe(1);
    });

    it('handles complex deletion with node merging', () => {
      const t = new CompressedTrie();
      // Build a tree that will need merging on delete
      t.insert('test');
      t.insert('testing');
      t.insert('tester');

      t.delete('test');
      expect(t.search('test')).toBe(false);
      expect(t.search('testing')).toBe(true);
      expect(t.search('tester')).toBe(true);

      t.delete('testing');
      expect(t.search('testing')).toBe(false);
      expect(t.search('tester')).toBe(true);
      expect(t.size).toBe(1);
    });
  });

  // ── Autocomplete ──────────────────────────────────────────────────

  describe('autocomplete', () => {
    it('returns all words with a given prefix in lexicographic order', () => {
      const t = new CompressedTrie();
      t.insert('apple');
      t.insert('app');
      t.insert('application');
      t.insert('apply');
      t.insert('banana');
      expect(t.autocomplete('app')).toEqual([
        'app',
        'apple',
        'application',
        'apply',
      ]);
    });

    it('returns empty array for non-existent prefix', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      expect(t.autocomplete('world')).toEqual([]);
    });

    it('respects the limit parameter', () => {
      const t = new CompressedTrie();
      t.insert('a');
      t.insert('ab');
      t.insert('abc');
      t.insert('abcd');
      t.insert('abcde');
      const results = t.autocomplete('a', 3);
      expect(results).toHaveLength(3);
      expect(results).toEqual(['a', 'ab', 'abc']);
    });

    it('returns exact match if word equals prefix', () => {
      const t = new CompressedTrie();
      t.insert('hello');
      expect(t.autocomplete('hello')).toEqual(['hello']);
    });

    it('handles prefix that ends in the middle of an edge label', () => {
      const t = new CompressedTrie();
      t.insert('testing');
      t.insert('tester');
      // "test" ends in the middle of the common prefix "test"
      const results = t.autocomplete('test');
      expect(results).toEqual(['tester', 'testing']);
    });

    it('returns all words with empty prefix', () => {
      const t = new CompressedTrie();
      t.insert('cat');
      t.insert('bat');
      t.insert('ant');
      expect(t.autocomplete('')).toEqual(['ant', 'bat', 'cat']);
    });
  });

  // ── allWords ──────────────────────────────────────────────────────

  describe('allWords', () => {
    it('returns all words in lexicographic order', () => {
      const t = new CompressedTrie();
      t.insert('banana');
      t.insert('apple');
      t.insert('cherry');
      t.insert('avocado');
      expect(t.allWords()).toEqual(['apple', 'avocado', 'banana', 'cherry']);
    });

    it('handles words with overlapping prefixes', () => {
      const t = new CompressedTrie();
      t.insert('the');
      t.insert('them');
      t.insert('there');
      t.insert('these');
      t.insert('then');
      expect(t.allWords()).toEqual(['the', 'them', 'then', 'there', 'these']);
    });
  });

  // ── Compression verification ──────────────────────────────────────

  describe('compression', () => {
    it('uses fewer nodes than a standard trie for long shared prefixes', () => {
      const t = new CompressedTrie();
      // All words share the prefix "internationalization"
      t.insert('internationalization');
      t.insert('international');
      t.insert('internalize');
      t.insert('internet');

      // A standard trie would need one node per character along unique paths.
      // A compressed trie should have far fewer nodes.
      // With 4 words, the compressed trie should have at most:
      // root + intern (shared) + et/ational (split) + ... ≈ ~8 nodes
      // whereas a standard trie would have 20+ nodes
      expect(t.nodeCount()).toBeLessThan(20);
    });

    it('has exactly n+1 nodes for n single-char words with distinct first chars', () => {
      const t = new CompressedTrie();
      t.insert('a');
      t.insert('b');
      t.insert('c');
      // root + 3 leaves = 4 nodes
      expect(t.nodeCount()).toBe(4);
    });

    it('single word results in just root + one node', () => {
      const t = new CompressedTrie();
      t.insert('abcdefghijklmnop');
      // root + single leaf with full label
      expect(t.nodeCount()).toBe(2);
    });
  });

  // ── Edge cases and larger inputs ──────────────────────────────────

  describe('edge cases', () => {
    it('handles words with special characters', () => {
      const t = new CompressedTrie();
      t.insert('hello-world');
      t.insert('hello_world');
      t.insert('hello world');
      expect(t.search('hello-world')).toBe(true);
      expect(t.search('hello_world')).toBe(true);
      expect(t.search('hello world')).toBe(true);
      expect(t.size).toBe(3);
    });

    it('handles a large number of insertions', () => {
      const t = new CompressedTrie();
      const words: string[] = [];
      for (let i = 0; i < 1000; i++) {
        words.push(`word${i.toString().padStart(4, '0')}`);
      }
      for (const w of words) {
        t.insert(w);
      }
      expect(t.size).toBe(1000);
      for (const w of words) {
        expect(t.search(w)).toBe(true);
      }
    });

    it('insert, delete, re-insert cycle works correctly', () => {
      const t = new CompressedTrie();
      t.insert('test');
      expect(t.search('test')).toBe(true);
      t.delete('test');
      expect(t.search('test')).toBe(false);
      t.insert('test');
      expect(t.search('test')).toBe(true);
      expect(t.size).toBe(1);
    });

    it('handles identical prefix and different suffixes', () => {
      const t = new CompressedTrie();
      t.insert('prefix_alpha');
      t.insert('prefix_beta');
      t.insert('prefix_gamma');
      expect(t.autocomplete('prefix_')).toEqual([
        'prefix_alpha',
        'prefix_beta',
        'prefix_gamma',
      ]);
    });

    it('handles the pathological case of successive single-char extensions', () => {
      const t = new CompressedTrie();
      t.insert('a');
      t.insert('ab');
      t.insert('abc');
      t.insert('abcd');
      t.insert('abcde');

      expect(t.size).toBe(5);
      for (const w of ['a', 'ab', 'abc', 'abcd', 'abcde']) {
        expect(t.search(w)).toBe(true);
      }
    });
  });
});
