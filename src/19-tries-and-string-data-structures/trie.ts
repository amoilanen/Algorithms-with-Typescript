/**
 * A node in a standard trie (prefix tree).
 *
 * Each node stores a map from characters to child nodes and a flag
 * indicating whether the node marks the end of a stored word.
 */
export class TrieNode {
  readonly children = new Map<string, TrieNode>();
  isEnd = false;
}

/**
 * A trie (prefix tree) for storing and searching strings.
 *
 * A trie is a rooted tree where each edge is labeled with a character and
 * each path from the root to a node marked as "end" represents a stored
 * word. Because prefixes are shared, the trie uses far less space than
 * storing each string independently when the strings share common prefixes.
 *
 * Operations (where m = length of the key):
 *   - insert(word):       Add a word to the trie.                O(m)
 *   - search(word):       Check if a word is in the trie.        O(m)
 *   - startsWith(prefix): Check if any word has a given prefix.  O(m)
 *   - delete(word):       Remove a word from the trie.           O(m)
 *   - autocomplete(prefix, limit): Find all words with a prefix. O(m + k)
 *     where k is the total number of characters in matching words.
 *
 * Space complexity: O(N * SIGMA) in the worst case, where N is the total
 * number of characters across all stored words and SIGMA is the alphabet
 * size. In practice, shared prefixes reduce this substantially.
 */
export class Trie {
  private readonly root = new TrieNode();
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
   * Insert a word into the trie.
   * If the word is already present, this is a no-op.
   */
  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      let child = node.children.get(ch);
      if (child === undefined) {
        child = new TrieNode();
        node.children.set(ch, child);
      }
      node = child;
    }
    if (!node.isEnd) {
      node.isEnd = true;
      this._size++;
    }
  }

  /**
   * Check whether a word is stored in the trie.
   */
  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  /**
   * Check whether any stored word starts with the given prefix.
   */
  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  /**
   * Delete a word from the trie.
   * Returns true if the word was found and removed, false otherwise.
   *
   * Deletion removes nodes that are no longer needed (i.e., nodes that
   * are not the end of another word and have no children).
   */
  delete(word: string): boolean {
    if (!this.search(word)) return false;
    this.deleteHelper(this.root, word, 0);
    this._size--;
    return true;
  }

  /**
   * Return all words in the trie that start with the given prefix.
   * Results are returned in lexicographic order.
   *
   * @param prefix - The prefix to match.
   * @param limit  - Maximum number of results (default: Infinity).
   */
  autocomplete(prefix: string, limit = Infinity): string[] {
    const node = this.findNode(prefix);
    if (node === null) return [];

    const results: string[] = [];
    this.collectWords(node, prefix, results, limit);
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

  // ── Private helpers ────────────────────────────────────────────────

  /**
   * Navigate the trie following the characters of `key`.
   * Returns the final node if every character was found, or null.
   */
  private findNode(key: string): TrieNode | null {
    let node: TrieNode = this.root;
    for (const ch of key) {
      const child = node.children.get(ch);
      if (child === undefined) return null;
      node = child;
    }
    return node;
  }

  /**
   * Recursively delete a word from the trie, cleaning up any nodes
   * that are no longer needed.
   *
   * Returns true if the caller should delete the child node
   * (because it has no children and is not the end of another word).
   */
  private deleteHelper(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      node.isEnd = false;
      // Delete this node if it has no children
      return node.children.size === 0;
    }

    const ch = word[depth]!;
    const child = node.children.get(ch);
    if (child === undefined) return false;

    const shouldDeleteChild = this.deleteHelper(child, word, depth + 1);

    if (shouldDeleteChild) {
      node.children.delete(ch);
      // Delete this node too if it has no remaining children and is not a word end
      return node.children.size === 0 && !node.isEnd;
    }

    return false;
  }

  /**
   * Collect all words in the subtree rooted at `node`, each prefixed
   * with `prefix`. Stops after collecting `limit` words.
   */
  private collectWords(
    node: TrieNode,
    prefix: string,
    results: string[],
    limit: number,
  ): void {
    if (results.length >= limit) return;

    if (node.isEnd) {
      results.push(prefix);
      if (results.length >= limit) return;
    }

    // Iterate children in sorted order for lexicographic results
    const sortedKeys = [...node.children.keys()].sort();
    for (const ch of sortedKeys) {
      this.collectWords(node.children.get(ch)!, prefix + ch, results, limit);
      if (results.length >= limit) return;
    }
  }
}
