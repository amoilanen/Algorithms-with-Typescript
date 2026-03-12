import { describe, it, expect } from 'vitest';
import {
  buildHuffmanTree,
  buildCodeTable,
  huffmanEncode,
  huffmanDecode,
  type HuffmanNode,
} from '../../src/17-greedy-algorithms/huffman.js';

// ── Helpers ──────────────────────────────────────────────────────

/** Collect all leaf characters from a Huffman tree. */
function collectLeaves(node: HuffmanNode): string[] {
  if (node.kind === 'leaf') return [node.char];
  return [...collectLeaves(node.left), ...collectLeaves(node.right)];
}

/** Verify that a code table is prefix-free. */
function isPrefixFree(table: Map<string, string>): boolean {
  const codes = [...table.values()];
  for (let i = 0; i < codes.length; i++) {
    for (let j = 0; j < codes.length; j++) {
      if (i !== j && codes[j]!.startsWith(codes[i]!)) {
        return false;
      }
    }
  }
  return true;
}

// ── buildHuffmanTree ─────────────────────────────────────────────

describe('buildHuffmanTree', () => {
  it('throws on empty frequency map', () => {
    expect(() => buildHuffmanTree(new Map())).toThrow(RangeError);
  });

  it('throws on non-positive frequency', () => {
    expect(() => buildHuffmanTree(new Map([['a', 0]]))).toThrow(RangeError);
    expect(() => buildHuffmanTree(new Map([['a', -1]]))).toThrow(RangeError);
  });

  it('returns a leaf for a single character', () => {
    const tree = buildHuffmanTree(new Map([['a', 5]]));
    expect(tree.kind).toBe('leaf');
    if (tree.kind === 'leaf') {
      expect(tree.char).toBe('a');
      expect(tree.freq).toBe(5);
    }
  });

  it('builds a valid tree for two characters', () => {
    const tree = buildHuffmanTree(
      new Map([
        ['a', 3],
        ['b', 7],
      ]),
    );
    expect(tree.kind).toBe('internal');
    expect(tree.freq).toBe(10);
    const leaves = collectLeaves(tree).sort();
    expect(leaves).toEqual(['a', 'b']);
  });

  it('builds a tree whose root frequency equals total frequency', () => {
    const freqs = new Map([
      ['a', 5],
      ['b', 9],
      ['c', 12],
      ['d', 13],
      ['e', 16],
      ['f', 45],
    ]);
    const tree = buildHuffmanTree(freqs);
    expect(tree.freq).toBe(100);
  });

  it('contains all characters as leaves', () => {
    const freqs = new Map([
      ['x', 1],
      ['y', 2],
      ['z', 3],
    ]);
    const tree = buildHuffmanTree(freqs);
    const leaves = collectLeaves(tree).sort();
    expect(leaves).toEqual(['x', 'y', 'z']);
  });
});

// ── buildCodeTable ───────────────────────────────────────────────

describe('buildCodeTable', () => {
  it('assigns code "0" to a single-character tree', () => {
    const tree = buildHuffmanTree(new Map([['a', 5]]));
    const table = buildCodeTable(tree);
    expect(table.get('a')).toBe('0');
  });

  it('produces prefix-free codes', () => {
    const freqs = new Map([
      ['a', 5],
      ['b', 9],
      ['c', 12],
      ['d', 13],
      ['e', 16],
      ['f', 45],
    ]);
    const tree = buildHuffmanTree(freqs);
    const table = buildCodeTable(tree);
    expect(isPrefixFree(table)).toBe(true);
  });

  it('assigns shorter codes to more frequent characters', () => {
    const freqs = new Map([
      ['a', 1],
      ['b', 100],
    ]);
    const tree = buildHuffmanTree(freqs);
    const table = buildCodeTable(tree);
    expect(table.get('b')!.length).toBeLessThanOrEqual(
      table.get('a')!.length,
    );
  });

  it('codes consist only of 0s and 1s', () => {
    const freqs = new Map([
      ['a', 5],
      ['b', 9],
      ['c', 12],
    ]);
    const tree = buildHuffmanTree(freqs);
    const table = buildCodeTable(tree);
    for (const code of table.values()) {
      expect(code).toMatch(/^[01]+$/);
    }
  });
});

// ── huffmanEncode ────────────────────────────────────────────────

describe('huffmanEncode', () => {
  it('throws on empty text', () => {
    expect(() => huffmanEncode('')).toThrow(RangeError);
  });

  it('encodes a single-character string', () => {
    const result = huffmanEncode('aaaa');
    expect(result.encoded).toBe('0000');
    expect(result.codeTable.size).toBe(1);
    expect(result.codeTable.get('a')).toBe('0');
  });

  it('produces an encoded string containing only 0s and 1s', () => {
    const result = huffmanEncode('hello world');
    expect(result.encoded).toMatch(/^[01]+$/);
  });

  it('produces a shorter encoding for text with skewed frequencies', () => {
    // 'a' appears much more than 'b', so the total encoding should be
    // shorter than a fixed-width encoding (each character = ceil(log2(2)) = 1 bit,
    // but Huffman won't beat 1 bit/char for 2 chars; use more chars).
    const text = 'a'.repeat(100) + 'bc';
    const result = huffmanEncode(text);
    // Fixed-width for 3 symbols = 2 bits each = 204 bits total.
    // Huffman should use ~1 bit for 'a' and longer codes for 'b','c'.
    expect(result.encoded.length).toBeLessThan(204);
  });
});

// ── huffmanDecode ────────────────────────────────────────────────

describe('huffmanDecode', () => {
  it('decodes to the original single-character string', () => {
    const result = huffmanEncode('aaaa');
    const decoded = huffmanDecode(result.encoded, result.tree);
    expect(decoded).toBe('aaaa');
  });

  it('round-trips a simple string', () => {
    const original = 'hello world';
    const result = huffmanEncode(original);
    const decoded = huffmanDecode(result.encoded, result.tree);
    expect(decoded).toBe(original);
  });

  it('round-trips a string with many distinct characters', () => {
    const original = 'the quick brown fox jumps over the lazy dog';
    const result = huffmanEncode(original);
    const decoded = huffmanDecode(result.encoded, result.tree);
    expect(decoded).toBe(original);
  });

  it('round-trips a string with heavily skewed frequencies', () => {
    const original = 'a'.repeat(1000) + 'b'.repeat(10) + 'c';
    const result = huffmanEncode(original);
    const decoded = huffmanDecode(result.encoded, result.tree);
    expect(decoded).toBe(original);
  });

  it('round-trips a two-character string', () => {
    const original = 'ab';
    const result = huffmanEncode(original);
    const decoded = huffmanDecode(result.encoded, result.tree);
    expect(decoded).toBe(original);
  });

  it('throws on malformed encoded string (ends mid-codeword)', () => {
    const freqs = new Map([
      ['a', 5],
      ['b', 9],
      ['c', 12],
    ]);
    const tree = buildHuffmanTree(freqs);
    // Grab a valid code and truncate it.
    const table = buildCodeTable(tree);
    const longestCode = [...table.values()].sort((a, b) => b.length - a.length)[0]!;
    if (longestCode.length > 1) {
      const truncated = longestCode.slice(0, -1);
      expect(() => huffmanDecode(truncated, tree)).toThrow();
    }
  });

  it('decodes empty encoded string to empty output', () => {
    const freqs = new Map([
      ['a', 5],
      ['b', 9],
    ]);
    const tree = buildHuffmanTree(freqs);
    const decoded = huffmanDecode('', tree);
    expect(decoded).toBe('');
  });
});

// ── End-to-end property checks ───────────────────────────────────

describe('Huffman end-to-end properties', () => {
  it('code table has one entry per distinct character', () => {
    const text = 'abracadabra';
    const result = huffmanEncode(text);
    const distinct = new Set(text).size;
    expect(result.codeTable.size).toBe(distinct);
  });

  it('encoding length equals sum of (char frequency × code length)', () => {
    const text = 'abracadabra';
    const result = huffmanEncode(text);
    const freqs = new Map<string, number>();
    for (const ch of text) freqs.set(ch, (freqs.get(ch) ?? 0) + 1);

    let expectedLength = 0;
    for (const [ch, freq] of freqs) {
      expectedLength += freq * result.codeTable.get(ch)!.length;
    }
    expect(result.encoded.length).toBe(expectedLength);
  });

  it('prefix-free property holds for various inputs', () => {
    const inputs = [
      'aab',
      'abcdef',
      'aaaaaabbbccdd',
      'the quick brown fox',
    ];
    for (const text of inputs) {
      const result = huffmanEncode(text);
      expect(isPrefixFree(result.codeTable)).toBe(true);
    }
  });
});
