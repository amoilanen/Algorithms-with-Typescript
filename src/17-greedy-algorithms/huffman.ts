/**
 * Huffman coding: a greedy algorithm for optimal prefix-free binary codes.
 *
 * Given character frequencies, Huffman's algorithm builds a binary tree
 * that minimizes the weighted path length, producing an optimal
 * variable-length encoding.
 *
 * @module
 */

import { BinaryHeap } from '../11-heaps-and-priority-queues/binary-heap';

// ── Types ────────────────────────────────────────────────────────

/** A node in the Huffman tree. */
export type HuffmanNode = HuffmanLeaf | HuffmanInternal;

export interface HuffmanLeaf {
  kind: 'leaf';
  char: string;
  freq: number;
}

export interface HuffmanInternal {
  kind: 'internal';
  freq: number;
  left: HuffmanNode;
  right: HuffmanNode;
}

/** A mapping from characters to their binary code strings (e.g. `'0110'`). */
export type HuffmanCodeTable = Map<string, string>;

/**
 * The result of Huffman encoding.
 *
 * - `encoded`   — the encoded bit string (e.g. `'01101001...'`).
 * - `codeTable` — the mapping from characters to bit strings.
 * - `tree`      — the Huffman tree (needed for decoding).
 */
export interface HuffmanEncodingResult {
  encoded: string;
  codeTable: HuffmanCodeTable;
  tree: HuffmanNode;
}

// ── Tree construction ────────────────────────────────────────────

/**
 * Build a Huffman tree from a frequency map.
 *
 * The algorithm repeatedly extracts the two lowest-frequency nodes from a
 * min-heap and merges them into an internal node whose frequency is the
 * sum of its children, until a single root remains.
 *
 * ### Complexity
 * - Time:  O(n log n) where n = number of distinct characters
 * - Space: O(n) for the tree and heap
 *
 * @param frequencies  A map from characters to their frequencies.
 *                     Frequencies must be positive.
 * @returns The root of the Huffman tree.
 * @throws {RangeError} If the frequency map is empty or contains
 *         non-positive frequencies.
 */
export function buildHuffmanTree(
  frequencies: ReadonlyMap<string, number>,
): HuffmanNode {
  if (frequencies.size === 0) {
    throw new RangeError('frequency map must not be empty');
  }

  for (const [char, freq] of frequencies) {
    if (freq <= 0) {
      throw new RangeError(
        `frequency for '${char}' must be positive, got ${freq}`,
      );
    }
  }

  // Special case: single character — return a leaf.
  if (frequencies.size === 1) {
    const [char, freq] = [...frequencies][0]!;
    return { kind: 'leaf', char, freq };
  }

  const heap = new BinaryHeap<HuffmanNode>((a, b) => a.freq - b.freq);
  for (const [char, freq] of frequencies) {
    heap.insert({ kind: 'leaf', char, freq });
  }

  while (heap.size > 1) {
    const left = heap.extract()!;
    const right = heap.extract()!;
    const merged: HuffmanInternal = {
      kind: 'internal',
      freq: left.freq + right.freq,
      left,
      right,
    };
    heap.insert(merged);
  }

  return heap.extract()!;
}

// ── Code-table generation ────────────────────────────────────────

/**
 * Derive the code table (character → bit string) from a Huffman tree.
 *
 * ### Complexity
 * - Time:  O(n) — one pass over all leaves
 * - Space: O(n) — the code table
 *
 * @param root  The root of a Huffman tree built by {@link buildHuffmanTree}.
 * @returns A {@link HuffmanCodeTable} mapping each character to its
 *          prefix-free binary code.
 */
export function buildCodeTable(root: HuffmanNode): HuffmanCodeTable {
  const table: HuffmanCodeTable = new Map();

  // Special case: single character gets code '0'.
  if (root.kind === 'leaf') {
    table.set(root.char, '0');
    return table;
  }

  function walk(node: HuffmanNode, prefix: string): void {
    if (node.kind === 'leaf') {
      table.set(node.char, prefix);
      return;
    }
    walk(node.left, prefix + '0');
    walk(node.right, prefix + '1');
  }

  walk(root, '');
  return table;
}

// ── Encoding ─────────────────────────────────────────────────────

/**
 * Encode a string using Huffman coding.
 *
 * Builds the optimal Huffman tree from the character frequencies in the
 * input, then replaces each character with its variable-length binary code.
 *
 * ### Complexity
 * - Time:  O(n log k) where n = input length, k = distinct characters
 * - Space: O(n + k)
 *
 * @param text  The string to encode. Must be non-empty.
 * @returns A {@link HuffmanEncodingResult} containing the encoded bit
 *          string, code table, and tree.
 * @throws {RangeError} If `text` is empty.
 */
export function huffmanEncode(text: string): HuffmanEncodingResult {
  if (text.length === 0) {
    throw new RangeError('text must be non-empty');
  }

  // Count frequencies.
  const frequencies = new Map<string, number>();
  for (const ch of text) {
    frequencies.set(ch, (frequencies.get(ch) ?? 0) + 1);
  }

  const tree = buildHuffmanTree(frequencies);
  const codeTable = buildCodeTable(tree);

  // Encode.
  let encoded = '';
  for (const ch of text) {
    encoded += codeTable.get(ch)!;
  }

  return { encoded, codeTable, tree };
}

// ── Decoding ─────────────────────────────────────────────────────

/**
 * Decode a Huffman-encoded bit string back to the original text.
 *
 * Walks the Huffman tree from root to leaf for each bit in the encoded
 * string, emitting a character each time a leaf is reached.
 *
 * ### Complexity
 * - Time:  O(m) where m = length of the encoded bit string
 * - Space: O(n) where n = length of the decoded text
 *
 * @param encoded  The encoded bit string (characters `'0'` and `'1'`).
 * @param tree     The Huffman tree used during encoding.
 * @returns The decoded original text.
 * @throws {Error} If the encoded string contains invalid bits or is
 *         malformed (does not end on a leaf boundary).
 */
export function huffmanDecode(encoded: string, tree: HuffmanNode): string {
  // Special case: single-character tree.
  if (tree.kind === 'leaf') {
    let result = '';
    for (const bit of encoded) {
      if (bit !== '0') {
        throw new Error(`unexpected bit '${bit}' for single-character tree`);
      }
      result += tree.char;
    }
    return result;
  }

  let result = '';
  let node: HuffmanNode = tree;

  for (const bit of encoded) {
    if (node.kind !== 'internal') {
      throw new Error('encoded string is longer than expected');
    }
    node = bit === '0' ? node.left : node.right;

    if (node.kind === 'leaf') {
      result += node.char;
      node = tree;
    }
  }

  if (node !== tree) {
    throw new Error(
      'encoded string ends in the middle of a codeword',
    );
  }

  return result;
}
