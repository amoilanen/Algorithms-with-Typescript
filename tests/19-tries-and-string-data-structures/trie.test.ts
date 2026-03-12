import { describe, it, expect } from 'vitest';
import { Trie } from '../../src/19-tries-and-string-data-structures/trie.js';

describe('Trie', () => {
  // ── Construction and empty state ──────────────────────────────────

  describe('empty trie', () => {
    it('has size 0', () => {
      const t = new Trie();
      expect(t.size).toBe(0);
    });

    it('is empty', () => {
      const t = new Trie();
      expect(t.isEmpty).toBe(true);
    });

    it('search returns false for any word', () => {
      const t = new Trie();
      expect(t.search('hello')).toBe(false);
      expect(t.search('')).toBe(false);
    });

    it('startsWith returns false', () => {
      const t = new Trie();
      expect(t.startsWith('a')).toBe(false);
    });

    it('autocomplete returns empty array', () => {
      const t = new Trie();
      expect(t.autocomplete('a')).toEqual([]);
    });

    it('allWords returns empty array', () => {
      const t = new Trie();
      expect(t.allWords()).toEqual([]);
    });

    it('delete returns false', () => {
      const t = new Trie();
      expect(t.delete('hello')).toBe(false);
    });
  });

  // ── Insert and search ─────────────────────────────────────────────

  describe('insert and search', () => {
    it('inserts and finds a single word', () => {
      const t = new Trie();
      t.insert('hello');
      expect(t.search('hello')).toBe(true);
      expect(t.size).toBe(1);
    });

    it('does not find a prefix that is not a complete word', () => {
      const t = new Trie();
      t.insert('hello');
      expect(t.search('hell')).toBe(false);
      expect(t.search('hel')).toBe(false);
      expect(t.search('he')).toBe(false);
      expect(t.search('h')).toBe(false);
    });

    it('does not find a word that extends beyond stored words', () => {
      const t = new Trie();
      t.insert('hello');
      expect(t.search('helloo')).toBe(false);
      expect(t.search('helloworld')).toBe(false);
    });

    it('inserts multiple words with shared prefixes', () => {
      const t = new Trie();
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
      const t = new Trie();
      t.insert('cat');
      t.insert('dog');
      t.insert('fish');
      expect(t.search('cat')).toBe(true);
      expect(t.search('dog')).toBe(true);
      expect(t.search('fish')).toBe(true);
      expect(t.size).toBe(3);
    });

    it('handles single-character words', () => {
      const t = new Trie();
      t.insert('a');
      t.insert('b');
      expect(t.search('a')).toBe(true);
      expect(t.search('b')).toBe(true);
      expect(t.search('c')).toBe(false);
      expect(t.size).toBe(2);
    });

    it('handles empty string insertion', () => {
      const t = new Trie();
      t.insert('');
      expect(t.search('')).toBe(true);
      expect(t.size).toBe(1);
    });

    it('duplicate insertion is a no-op', () => {
      const t = new Trie();
      t.insert('hello');
      t.insert('hello');
      expect(t.size).toBe(1);
      expect(t.search('hello')).toBe(true);
    });
  });

  // ── startsWith ────────────────────────────────────────────────────

  describe('startsWith', () => {
    it('returns true for valid prefixes', () => {
      const t = new Trie();
      t.insert('apple');
      t.insert('application');
      expect(t.startsWith('app')).toBe(true);
      expect(t.startsWith('appl')).toBe(true);
      expect(t.startsWith('apple')).toBe(true);
      expect(t.startsWith('a')).toBe(true);
    });

    it('returns false for non-existent prefixes', () => {
      const t = new Trie();
      t.insert('apple');
      expect(t.startsWith('b')).toBe(false);
      expect(t.startsWith('apx')).toBe(false);
      expect(t.startsWith('applez')).toBe(false);
    });

    it('returns true for empty prefix when trie is non-empty', () => {
      const t = new Trie();
      t.insert('hello');
      expect(t.startsWith('')).toBe(true);
    });
  });

  // ── Delete ────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a word and confirms it is gone', () => {
      const t = new Trie();
      t.insert('hello');
      expect(t.delete('hello')).toBe(true);
      expect(t.search('hello')).toBe(false);
      expect(t.size).toBe(0);
      expect(t.isEmpty).toBe(true);
    });

    it('returns false when deleting a non-existent word', () => {
      const t = new Trie();
      t.insert('hello');
      expect(t.delete('world')).toBe(false);
      expect(t.size).toBe(1);
    });

    it('does not affect other words when deleting', () => {
      const t = new Trie();
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
      const t = new Trie();
      t.insert('he');
      t.insert('hello');
      expect(t.delete('he')).toBe(true);
      expect(t.search('he')).toBe(false);
      expect(t.search('hello')).toBe(true);
    });

    it('deletes a word that has another word as prefix', () => {
      const t = new Trie();
      t.insert('he');
      t.insert('hello');
      expect(t.delete('hello')).toBe(true);
      expect(t.search('hello')).toBe(false);
      expect(t.search('he')).toBe(true);
    });

    it('cleans up nodes that are no longer needed', () => {
      const t = new Trie();
      t.insert('abc');
      t.delete('abc');
      // After deletion, 'a' prefix should no longer be navigable
      expect(t.startsWith('a')).toBe(false);
      expect(t.startsWith('ab')).toBe(false);
    });

    it('does not clean up shared prefix nodes', () => {
      const t = new Trie();
      t.insert('abc');
      t.insert('abd');
      t.delete('abc');
      expect(t.startsWith('ab')).toBe(true);
      expect(t.search('abd')).toBe(true);
    });

    it('deletes the empty string', () => {
      const t = new Trie();
      t.insert('');
      t.insert('a');
      expect(t.delete('')).toBe(true);
      expect(t.search('')).toBe(false);
      expect(t.search('a')).toBe(true);
      expect(t.size).toBe(1);
    });
  });

  // ── Autocomplete ──────────────────────────────────────────────────

  describe('autocomplete', () => {
    it('returns all words with a given prefix in lexicographic order', () => {
      const t = new Trie();
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
      const t = new Trie();
      t.insert('hello');
      expect(t.autocomplete('world')).toEqual([]);
    });

    it('respects the limit parameter', () => {
      const t = new Trie();
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
      const t = new Trie();
      t.insert('hello');
      expect(t.autocomplete('hello')).toEqual(['hello']);
    });

    it('returns empty array for prefix longer than any word', () => {
      const t = new Trie();
      t.insert('hi');
      expect(t.autocomplete('high')).toEqual([]);
    });

    it('returns all words with empty prefix', () => {
      const t = new Trie();
      t.insert('cat');
      t.insert('bat');
      t.insert('ant');
      expect(t.autocomplete('')).toEqual(['ant', 'bat', 'cat']);
    });
  });

  // ── allWords ──────────────────────────────────────────────────────

  describe('allWords', () => {
    it('returns all words in lexicographic order', () => {
      const t = new Trie();
      t.insert('banana');
      t.insert('apple');
      t.insert('cherry');
      t.insert('avocado');
      expect(t.allWords()).toEqual(['apple', 'avocado', 'banana', 'cherry']);
    });

    it('handles words with overlapping prefixes', () => {
      const t = new Trie();
      t.insert('the');
      t.insert('them');
      t.insert('there');
      t.insert('these');
      t.insert('then');
      expect(t.allWords()).toEqual(['the', 'them', 'then', 'there', 'these']);
    });
  });

  // ── Edge cases and larger inputs ──────────────────────────────────

  describe('edge cases', () => {
    it('handles words with special characters', () => {
      const t = new Trie();
      t.insert('hello-world');
      t.insert('hello_world');
      t.insert('hello world');
      expect(t.search('hello-world')).toBe(true);
      expect(t.search('hello_world')).toBe(true);
      expect(t.search('hello world')).toBe(true);
      expect(t.size).toBe(3);
    });

    it('handles unicode characters', () => {
      const t = new Trie();
      t.insert('cafe');
      t.insert('caf\u00e9');
      expect(t.search('cafe')).toBe(true);
      expect(t.search('caf\u00e9')).toBe(true);
      expect(t.size).toBe(2);
    });

    it('handles a large number of insertions', () => {
      const t = new Trie();
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
      // Prefix search
      expect(t.autocomplete('word000')).toHaveLength(10); // word0000..word0009
    });

    it('insert, delete, re-insert cycle works correctly', () => {
      const t = new Trie();
      t.insert('test');
      expect(t.search('test')).toBe(true);
      t.delete('test');
      expect(t.search('test')).toBe(false);
      t.insert('test');
      expect(t.search('test')).toBe(true);
      expect(t.size).toBe(1);
    });
  });
});
