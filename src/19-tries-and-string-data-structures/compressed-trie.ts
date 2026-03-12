/**
 * A node in a compressed trie (radix tree / Patricia tree).
 *
 * Unlike a standard trie where each edge carries a single character,
 * a compressed trie stores an entire substring (label) on each edge.
 * This eliminates chains of nodes with a single child, significantly
 * reducing the number of nodes.
 */
export class CompressedTrieNode {
  readonly children = new Map<string, CompressedTrieNode>();
  /** The substring label on the edge from the parent to this node. */
  label: string;
  isEnd = false;

  constructor(label: string) {
    this.label = label;
  }
}

/**
 * A compressed trie (radix tree) for storing and searching strings.
 *
 * A compressed trie is a space-optimized trie in which every node that
 * is an only child is merged with its parent. Each edge carries a
 * substring rather than a single character. This guarantees that every
 * internal node (except the root) has at least two children, so the
 * number of internal nodes is at most one less than the number of stored
 * words.
 *
 * Operations (where m = length of the key):
 *   - insert(word):       Add a word.                            O(m)
 *   - search(word):       Check if a word is stored.             O(m)
 *   - startsWith(prefix): Check if any word has a given prefix.  O(m)
 *   - delete(word):       Remove a word.                         O(m)
 *   - autocomplete(prefix, limit): Find words with a prefix.    O(m + k)
 *
 * Space: O(N) where N is the total length of all stored words. In practice
 * much less than a standard trie because common prefixes are shared and
 * single-child chains are compressed into one node.
 */
export class CompressedTrie {
  private readonly root = new CompressedTrieNode('');
  private _size = 0;

  /** The number of words stored in the trie. */
  get size(): number {
    return this._size;
  }

  /** True if the trie contains no words. */
  get isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Insert a word into the compressed trie.
   * If the word is already present, this is a no-op.
   */
  insert(word: string): void {
    if (word.length === 0) {
      if (!this.root.isEnd) {
        this.root.isEnd = true;
        this._size++;
      }
      return;
    }

    this.insertHelper(this.root, word);
  }

  /**
   * Check whether a word is stored in the compressed trie.
   */
  search(word: string): boolean {
    if (word.length === 0) return this.root.isEnd;

    const result = this.findExactNode(this.root, word);
    if (result === null) return false;
    return result.isEnd;
  }

  /**
   * Check whether any stored word starts with the given prefix.
   */
  startsWith(prefix: string): boolean {
    if (prefix.length === 0) return this._size > 0 || this.root.isEnd;

    return this.findNodeForPrefix(this.root, prefix) !== null;
  }

  /**
   * Delete a word from the compressed trie.
   * Returns true if the word was found and removed, false otherwise.
   */
  delete(word: string): boolean {
    if (word.length === 0) {
      if (!this.root.isEnd) return false;
      this.root.isEnd = false;
      this._size--;
      // Try to merge root's only child if applicable
      if (this.root.children.size === 1 && !this.root.isEnd) {
        // Root is special — don't merge into it since root label must stay ''
      }
      return true;
    }

    const deleted = this.deleteHelper(this.root, word);
    if (deleted) this._size--;
    return deleted;
  }

  /**
   * Return all words in the trie that start with the given prefix.
   * Results are returned in lexicographic order.
   *
   * @param prefix - The prefix to match.
   * @param limit  - Maximum number of results (default: Infinity).
   */
  autocomplete(prefix: string, limit = Infinity): string[] {
    const results: string[] = [];

    if (prefix.length === 0) {
      this.collectWords(this.root, '', results, limit);
      return results;
    }

    // Navigate to the node where prefix ends
    const result = this.findNodeForPrefix(this.root, prefix);
    if (result === null) return [];

    const [node, matchedPrefix] = result;
    this.collectWords(node, matchedPrefix, results, limit);
    return results;
  }

  /**
   * Return all words stored in the trie in lexicographic order.
   */
  allWords(): string[] {
    const results: string[] = [];
    this.collectWords(this.root, '', results, Infinity);
    return results;
  }

  /**
   * Return the total number of nodes in the trie (for testing compression).
   */
  nodeCount(): number {
    return this.countNodes(this.root);
  }

  // ── Private helpers ────────────────────────────────────────────────

  private insertHelper(node: CompressedTrieNode, remaining: string): void {
    // Find a child whose label shares a common prefix with remaining
    const firstChar = remaining[0]!;
    const child = node.children.get(firstChar);

    if (child === undefined) {
      // No matching child — create a new leaf
      const newNode = new CompressedTrieNode(remaining);
      newNode.isEnd = true;
      node.children.set(firstChar, newNode);
      this._size++;
      return;
    }

    // Find the longest common prefix between child.label and remaining
    const commonLen = commonPrefixLength(child.label, remaining);

    if (commonLen === child.label.length && commonLen === remaining.length) {
      // Exact match with existing node
      if (!child.isEnd) {
        child.isEnd = true;
        this._size++;
      }
      return;
    }

    if (commonLen === child.label.length) {
      // child.label is a prefix of remaining — recurse into child
      this.insertHelper(child, remaining.slice(commonLen));
      return;
    }

    // Need to split: child.label and remaining diverge at position commonLen
    // Create a new intermediate node for the common prefix
    const splitNode = new CompressedTrieNode(child.label.slice(0, commonLen));
    node.children.set(firstChar, splitNode);

    // Move the existing child under the split node with shortened label
    child.label = child.label.slice(commonLen);
    splitNode.children.set(child.label[0]!, child);

    if (commonLen === remaining.length) {
      // The word to insert ends exactly at the split point
      splitNode.isEnd = true;
      this._size++;
    } else {
      // Create a new leaf for the remaining suffix
      const newLeaf = new CompressedTrieNode(remaining.slice(commonLen));
      newLeaf.isEnd = true;
      splitNode.children.set(newLeaf.label[0]!, newLeaf);
      this._size++;
    }
  }

  /**
   * Navigate the trie to find a node where the word ends exactly at
   * a node boundary. Returns the node if found, or null if the word
   * does not end at any node boundary.
   */
  private findExactNode(
    node: CompressedTrieNode,
    key: string,
  ): CompressedTrieNode | null {
    let offset = 0;

    for (;;) {
      if (offset === key.length) return node;

      const child = node.children.get(key[offset]!);
      if (child === undefined) return null;

      const label = child.label;
      const remaining = key.length - offset;

      if (remaining < label.length) {
        // Key ends within this edge's label — not an exact match
        return null;
      }

      // Check if key matches this label segment
      if (key.slice(offset, offset + label.length) !== label) {
        return null;
      }

      offset += label.length;
      node = child;
    }
  }

  /**
   * Navigate the trie for prefix queries. Unlike findNodeAndOffset,
   * this also handles the case where the prefix ends in the middle
   * of an edge label.
   *
   * Returns [node, fullPrefix] where fullPrefix is the prefix string
   * that leads to node (may be longer than the input prefix if we
   * entered a node whose label extends beyond the prefix).
   */
  private findNodeForPrefix(
    node: CompressedTrieNode,
    prefix: string,
  ): [CompressedTrieNode, string] | null {
    let offset = 0;
    let builtPrefix = '';

    for (;;) {
      if (offset === prefix.length) return [node, builtPrefix];

      const child = node.children.get(prefix[offset]!);
      if (child === undefined) return null;

      const label = child.label;
      const remaining = prefix.length - offset;

      if (remaining <= label.length) {
        // Prefix ends within or exactly at this label
        if (label.slice(0, remaining) === prefix.slice(offset)) {
          return [child, builtPrefix + label];
        }
        return null;
      }

      // Must match the full label to continue
      if (prefix.slice(offset, offset + label.length) !== label) {
        return null;
      }

      builtPrefix += label;
      offset += label.length;
      node = child;
    }
  }

  /**
   * Recursively delete a word, cleaning up unnecessary nodes.
   * Returns true if the word was found and removed.
   */
  private deleteHelper(node: CompressedTrieNode, remaining: string): boolean {
    const firstChar = remaining[0]!;
    const child = node.children.get(firstChar);
    if (child === undefined) return false;

    const commonLen = commonPrefixLength(child.label, remaining);

    if (commonLen < child.label.length) {
      // remaining doesn't fully match child's label — word not found
      return false;
    }

    if (commonLen === remaining.length) {
      // We've arrived at the node for this word
      if (!child.isEnd) return false;
      child.isEnd = false;

      if (child.children.size === 0) {
        // Leaf node — remove it entirely
        node.children.delete(firstChar);
        // If the parent now has exactly one child and is not a word-end
        // (and is not the root), it can be merged — handled by caller
        this.tryMerge(node);
      } else if (child.children.size === 1) {
        // Node is no longer a word-end and has exactly one child — merge
        this.mergeWithChild(node, firstChar, child);
      }
      return true;
    }

    // Recurse deeper
    const deleted = this.deleteHelper(child, remaining.slice(commonLen));

    if (deleted) {
      // After recursive deletion, child may need merging
      if (!child.isEnd && child.children.size === 1) {
        this.mergeWithChild(node, firstChar, child);
      }
    }

    return deleted;
  }

  /**
   * Merge a node with its only child by concatenating their labels.
   * This maintains the compressed trie invariant.
   */
  private mergeWithChild(
    parent: CompressedTrieNode,
    key: string,
    node: CompressedTrieNode,
  ): void {
    if (node.children.size !== 1 || node.isEnd) return;

    const entry = [...node.children.entries()][0]!;
    const onlyChild = entry[1];
    onlyChild.label = node.label + onlyChild.label;
    parent.children.set(key, onlyChild);
  }

  /**
   * After removing a child from a non-root node, try to merge the node
   * with its single remaining child if applicable.
   */
  private tryMerge(node: CompressedTrieNode): void {
    // Don't merge root
    if (node === this.root) return;
    // Merging is handled by the parent in deleteHelper
  }

  /**
   * Collect all words in the subtree rooted at `node`, each prefixed
   * with `currentPrefix`. Stops after collecting `limit` words.
   */
  private collectWords(
    node: CompressedTrieNode,
    currentPrefix: string,
    results: string[],
    limit: number,
  ): void {
    if (results.length >= limit) return;

    if (node.isEnd) {
      results.push(currentPrefix);
      if (results.length >= limit) return;
    }

    const sortedKeys = [...node.children.keys()].sort();
    for (const ch of sortedKeys) {
      const child = node.children.get(ch)!;
      this.collectWords(
        child,
        currentPrefix + child.label,
        results,
        limit,
      );
      if (results.length >= limit) return;
    }
  }

  private countNodes(node: CompressedTrieNode): number {
    let count = 1;
    for (const child of node.children.values()) {
      count += this.countNodes(child);
    }
    return count;
  }
}

/**
 * Return the length of the longest common prefix of two strings.
 */
function commonPrefixLength(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let i = 0;
  while (i < len && a[i] === b[i]) i++;
  return i;
}
