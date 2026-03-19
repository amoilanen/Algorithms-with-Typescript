# Tries and String Data Structures

_The data structures we have studied so far — hash tables, balanced search trees, heaps — work well when keys are atomic values that can be compared or hashed in constant time. But many applications deal with **string** keys: dictionaries, autocomplete systems, IP routing tables, spell checkers, DNA sequence databases. For these, a data structure that exploits the **character-by-character structure** of keys can be far more efficient. The **trie** (from re**trie**val) is such a structure. In this chapter we develop the standard trie, optimize it into a **compressed trie** (radix tree) that eliminates wasted space, survey applications, and briefly introduce suffix arrays for substring search._

## The trie (prefix tree)

### Motivation

Consider storing a dictionary of $n$ words, where the total number of characters across all words is $N$, and answering these queries:

- **Lookup**: Is a given word in the dictionary?
- **Prefix search**: Are there any words starting with a given prefix?
- **Autocomplete**: List all words starting with a given prefix.

A hash table answers lookup in expected $O(m)$ time, where $m$ is the length of the query word (we must hash the entire word). But it cannot answer prefix queries without scanning every stored word. A balanced BST stores words in sorted order and can answer prefix queries via range searches, but each comparison costs $O(m)$, so lookup costs $O(m \log n)$.

A trie answers all three queries in $O(m)$ time — proportional to the length of the query, **independent of the number of stored words**. The key insight is that the trie avoids comparing entire keys; instead, it inspects one character at a time.

### Structure

A **trie** (also called a **prefix tree**) is a rooted tree where:

- Each edge is labeled with a single character from the alphabet $\Sigma$.
- Each node has at most $|\Sigma|$ children (one per character).
- A node may be marked as an **end-of-word** node, indicating that the path from the root to that node spells a complete word.
- The **root** represents the empty prefix.

The crucial property is **prefix sharing**: words that share a common prefix share the same path from the root. For example, "app", "apple", and "application" all share the path `a → p → p`.

### Operations

**Insert(word).** Starting from the root, follow (or create) the edge labeled with each character of the word. Mark the final node as an end-of-word.

**Search(word).** Starting from the root, follow the edge labeled with each character. If at any point the required edge does not exist, the word is not in the trie. If we reach the end of the word, check whether the current node is marked as an end-of-word.

**StartsWith(prefix).** Like search, but we do not require the final node to be an end-of-word. If we can follow all characters of the prefix, at least one stored word has that prefix.

**Delete(word).** First verify the word exists. Then unmark the end-of-word flag. If the node has no children and is not an end-of-word for another word, remove it. Propagate this cleanup upward: if a parent becomes childless and is not itself an end-of-word, remove it too. This ensures the trie does not retain unnecessary nodes.

**Autocomplete(prefix, limit).** Navigate to the node corresponding to the prefix, then collect all words in the subtree (via DFS), stopping after `limit` results.

### Complexity analysis

Let $m$ be the length of the key being operated on, and $|\Sigma|$ be the alphabet size.

| Operation | Time |
|-----------|------|
| `insert` | $O(m)$ |
| `search` | $O(m)$ |
| `startsWith` | $O(m)$ |
| `delete` | $O(m)$ |
| `autocomplete` | $O(m + k)$ where $k$ is the output size |

**Space.** In the worst case a trie stores one node per character of every stored word, for $O(N)$ nodes where $N$ is the total length of all words. Each node stores up to $|\Sigma|$ child pointers, so the total space is $O(N \cdot |\Sigma|)$. In practice, prefix sharing reduces the number of nodes significantly, especially when the stored words share many common prefixes.

When $|\Sigma|$ is small (e.g., DNA alphabet with 4 characters) or when using a hash map for child storage instead of a fixed-size array, the space is close to $O(N)$.

### Implementation

Our implementation uses a `Map<string, TrieNode>` for each node's children, which supports arbitrary alphabets and avoids wasting space on unused child slots:

```typescript
export class TrieNode {
  readonly children = new Map<string, TrieNode>();
  isEnd = false;
}

export class Trie {
  private readonly root = new TrieNode();
  private _size = 0;

  get size(): number {
    return this._size;
  }

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

  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  private findNode(key: string): TrieNode | null {
    let node: TrieNode = this.root;
    for (const ch of key) {
      const child = node.children.get(ch);
      if (child === undefined) return null;
      node = child;
    }
    return node;
  }
}
```

**Insert** iterates character by character, creating child nodes as needed. Each character lookup in the `Map` is $O(1)$ expected time, so the total is $O(m)$.

**Search** and **startsWith** both call `findNode`, which walks the trie following the key's characters. The difference is that `search` additionally checks the `isEnd` flag.

**Delete** is more involved because we must clean up nodes that are no longer needed:

```typescript
delete(word: string): boolean {
  if (!this.search(word)) return false;
  this.deleteHelper(this.root, word, 0);
  this._size--;
  return true;
}

private deleteHelper(node: TrieNode, word: string, depth: number): boolean {
  if (depth === word.length) {
    node.isEnd = false;
    return node.children.size === 0;
  }

  const ch = word[depth]!;
  const child = node.children.get(ch);
  if (child === undefined) return false;

  const shouldDeleteChild = this.deleteHelper(child, word, depth + 1);

  if (shouldDeleteChild) {
    node.children.delete(ch);
    return node.children.size === 0 && !node.isEnd;
  }

  return false;
}
```

The `deleteHelper` returns `true` when a node should be removed (it has no children and is not an end-of-word). This propagates up the recursion, cleaning the path.

**Autocomplete** navigates to the prefix node and then performs a DFS to collect all words in the subtree:

```typescript
autocomplete(prefix: string, limit = Infinity): string[] {
  const node = this.findNode(prefix);
  if (node === null) return [];

  const results: string[] = [];
  this.collectWords(node, prefix, results, limit);
  return results;
}

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

  const sortedKeys = [...node.children.keys()].sort();
  for (const ch of sortedKeys) {
    this.collectWords(node.children.get(ch)!, prefix + ch, results, limit);
    if (results.length >= limit) return;
  }
}
```

By iterating children in sorted order, we produce results in lexicographic order.

### Trace through an example

Let us insert the words "app", "apple", "apply", and "banana" into an initially empty trie.

**After inserting "app":**

```
(root)
  └─ a
     └─ p
        └─ p*
```

An asterisk (`*`) marks end-of-word nodes.

**After inserting "apple":**

```
(root)
  └─ a
     └─ p
        └─ p*
           └─ l
              └─ e*
```

The path `a → p → p` is shared. The new characters `l → e` extend from the existing "app" node.

**After inserting "apply":**

```
(root)
  └─ a
     └─ p
        └─ p*
           ├─ l
           │  ├─ e*
           │  └─ y*
```

The node for `l` now has two children: `e` (for "apple") and `y` (for "apply").

**After inserting "banana":**

```
(root)
  ├─ a
  │  └─ p
  │     └─ p*
  │        └─ l
  │           ├─ e*
  │           └─ y*
  └─ b
     └─ a
        └─ n
           └─ a
              └─ n
                 └─ a*
```

Now `autocomplete("app")` returns `["app", "apple", "apply"]` — the word "app" itself plus all words in its subtree.

## Compressed tries (radix trees)

### The problem with standard tries

In a standard trie, a chain of nodes with a single child wastes space. Consider storing only the word "internationalization" in a trie: it requires 20 nodes, each with exactly one child, plus the root. This is 21 nodes for a single word.

More generally, if the stored words have long unique suffixes, the trie degenerates into long chains. These chains use $O(1)$ space per character but create many nodes, each carrying a child map overhead.

### Compressing single-child chains

A **compressed trie** (also called a **radix tree** or **Patricia tree**) eliminates single-child chains by storing an entire substring on each edge rather than a single character. The rule is:

> **Every internal node (except the root) has at least two children.**

If a node has exactly one child and is not an end-of-word, it is merged with that child by concatenating their edge labels.

For example, the standard trie for {"romane", "romanus", "romulus", "rubens", "ruber", "rubicon", "rubicundus"} has many single-child chains. The compressed trie looks like:

```
(root)
  └─ "r"
     ├─ "om"
     │   ├─ "an"
     │   │   ├─ "e"*
     │   │   └─ "us"*
     │   └─ "ulus"*
     └─ "ub"
         ├─ "e"
         │   ├─ "ns"*
         │   └─ "r"*
         └─ "ic"
             ├─ "on"*
             └─ "undus"*
```

Instead of one node per character, each edge carries a substring. The total number of nodes is bounded by $2n + 1$ where $n$ is the number of stored words (at most $n$ leaves, at most $n - 1$ internal branching nodes, plus the root).

### Operations

The operations are conceptually the same as for a standard trie, but each step may match multiple characters at once:

**Insert(word).** Navigate the trie, matching the word against edge labels. There are three cases:

1. **No matching child.** Create a new leaf node with the remaining suffix as its label.
2. **Edge label is a prefix of the remaining word.** Recurse into the child with the rest of the word.
3. **Edge label and remaining word diverge.** Split the edge: create a new internal node at the divergence point, move the existing child beneath it with a shortened label, and create a new leaf for the remaining suffix.

**Search(word).** Navigate the trie, matching edge labels character by character. The word is found only if we arrive at a node boundary (not in the middle of an edge label) and the node is marked as an end-of-word.

**StartsWith(prefix).** Like search, but the prefix may end in the middle of an edge label — this is acceptable because the label continues with characters that extend the prefix.

**Delete(word).** Find and unmark the node. If it becomes a leaf, remove it. If its parent now has only one child and is not an end-of-word, merge the parent with its child by concatenating labels. This maintains the compressed trie invariant.

### Complexity

| Operation | Time |
|-----------|------|
| `insert` | $O(m)$ |
| `search` | $O(m)$ |
| `startsWith` | $O(m)$ |
| `delete` | $O(m)$ |
| `autocomplete` | $O(m + k)$ |

**Space.** The number of nodes is $O(n)$ where $n$ is the number of stored words — a major improvement over the standard trie's $O(N)$ nodes. However, each node stores a substring label, and the total length of all labels is $O(N)$. So total space is $O(N)$ in terms of characters stored, but with far fewer node objects.

### Implementation

The key difference from a standard trie is the **split** operation during insertion. When an edge label and the remaining word diverge at some position, we must create a new branching node:

```typescript
export class CompressedTrieNode {
  readonly children = new Map<string, CompressedTrieNode>();
  label: string;
  isEnd = false;

  constructor(label: string) {
    this.label = label;
  }
}
```

Each child in the map is keyed by the **first character** of its label. This allows $O(1)$ lookup of the correct child for the next character in the key.

The insert helper handles the three cases:

```typescript
private insertHelper(node: CompressedTrieNode, remaining: string): void {
  const firstChar = remaining[0]!;
  const child = node.children.get(firstChar);

  if (child === undefined) {
    // Case 1: no matching child — create a new leaf
    const newNode = new CompressedTrieNode(remaining);
    newNode.isEnd = true;
    node.children.set(firstChar, newNode);
    this._size++;
    return;
  }

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
    // Case 2: child label is a prefix of remaining — recurse
    this.insertHelper(child, remaining.slice(commonLen));
    return;
  }

  // Case 3: split — labels diverge at position commonLen
  const splitNode = new CompressedTrieNode(
    child.label.slice(0, commonLen),
  );
  node.children.set(firstChar, splitNode);

  // Move existing child beneath the split node
  child.label = child.label.slice(commonLen);
  splitNode.children.set(child.label[0]!, child);

  if (commonLen === remaining.length) {
    splitNode.isEnd = true;
    this._size++;
  } else {
    const newLeaf = new CompressedTrieNode(remaining.slice(commonLen));
    newLeaf.isEnd = true;
    splitNode.children.set(newLeaf.label[0]!, newLeaf);
    this._size++;
  }
}
```

Search must check that the word ends exactly at a node boundary — not partway through an edge label:

```typescript
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

    if (key.slice(offset, offset + label.length) !== label) {
      return null;
    }

    offset += label.length;
    node = child;
  }
}
```

Delete must maintain the compression invariant by merging nodes when appropriate:

```typescript
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
```

When a node loses its end-of-word flag (or a child is deleted) and has exactly one remaining child, we merge the node with that child by concatenating their labels and removing the intermediate node.

### Design decisions

**Map-based children, keyed by first character.** Each child's label starts with a unique character (since we split on divergence), so the first character serves as a unique key. This gives $O(1)$ child lookup.

**Separate `findExactNode` and `findNodeForPrefix`.** Search requires an exact match at a node boundary, while `startsWith` and `autocomplete` allow partial matches within an edge label. We use two different navigation methods to handle these semantics correctly.

**Node count tracking.** The `nodeCount()` method allows testing that the trie is properly compressed — for instance, a single word should result in exactly 2 nodes (root + one leaf), not one node per character.

## Standard trie vs. compressed trie

| Property | Standard trie | Compressed trie |
|----------|--------------|-----------------|
| Nodes | $O(N)$ | $O(n)$ |
| Space (total) | $O(N \cdot |\Sigma|)$ | $O(N)$ |
| Lookup time | $O(m)$ | $O(m)$ |
| Insert time | $O(m)$ | $O(m)$ |
| Implementation | Simpler | More complex (splitting/merging) |
| Best for | Small alphabets, many short words | Long words, shared prefixes |

Where $N$ = total characters across all words, $n$ = number of words, $m$ = query length, $|\Sigma|$ = alphabet size.

For most practical applications the compressed trie is preferred because it uses $O(n)$ nodes regardless of word length, and its operations have the same asymptotic time complexity as the standard trie.

## Applications

### Autocomplete and search suggestions

The most visible application of tries is autocomplete. When a user types a prefix in a search box, the system queries a trie to find all stored strings matching that prefix. The trie's structure makes this natural: navigate to the prefix node in $O(m)$ time, then enumerate the subtree.

In practice, autocomplete systems augment the trie with **frequency counts** or **ranking scores** at each end-of-word node, so the most popular completions are returned first.

### Spell checking

A trie can serve as the dictionary for a spell checker. Given a misspelled word, we can:

1. **Edit-distance search**: enumerate all words within edit distance 1 or 2 by performing DFS on the trie while tracking allowed edits (insertions, deletions, substitutions). This is far more efficient than computing edit distance against every dictionary word.
2. **Prefix validation**: as the user types, highlight prefixes that cannot lead to any valid word (the trie returns `startsWith(prefix) = false`).

### IP routing (longest prefix match)

Internet routers must match an incoming IP address against a routing table to determine the next hop. The routing table contains prefixes of various lengths, and the router must find the **longest matching prefix**. A trie indexed on the bits of the IP address solves this efficiently: navigate the trie bit by bit, keeping track of the last end-of-word node encountered. This is the standard data structure in router implementations.

Compressed tries (specifically, the **Patricia tree** variant) are particularly well-suited here because IP prefixes tend to be long and share common leading bits.

### T9 predictive text

The T9 system for numeric keypads maps each key to several letters (2 → {a, b, c}, 3 → {d, e, f}, etc.). Given a sequence of key presses, T9 must find all dictionary words that match. A trie indexed by the **key mappings** rather than the letters themselves allows efficient lookup.

### Bioinformatics

DNA sequences over the alphabet $\{A, C, G, T\}$ are naturally stored in tries with branching factor 4. Suffix tries (discussed below) enable fast substring search in genomic databases.

## Suffix arrays (conceptual overview)

While tries excel at prefix queries, many applications require **substring search**: given a text $T$ of length $n$, preprocess it so that queries "Does pattern $P$ appear in $T$?" can be answered quickly.

A **suffix array** is a sorted array of all suffixes of $T$, represented by their starting positions. For example, for $T =$ "banana":

| Index | Suffix |
|-------|--------|
| 5 | "a" |
| 3 | "ana" |
| 1 | "anana" |
| 0 | "banana" |
| 4 | "na" |
| 2 | "nana" |

Since the array is sorted, we can binary-search for any pattern $P$ in $O(m \log n)$ time, where $m = |P|$. With an auxiliary **LCP array** (longest common prefix between consecutive suffixes), this can be improved to $O(m + \log n)$.

**Construction.** A suffix array can be built in $O(n)$ time using the SA-IS algorithm or in $O(n \log n)$ time using simpler prefix-doubling approaches. The space is $O(n)$ — just an array of integers.

**Relation to suffix trees.** A **suffix tree** is a compressed trie of all suffixes of $T$. It supports $O(m)$ substring queries (faster than suffix arrays without LCP) but uses significantly more space — typically 10-20 times the size of the text. Suffix arrays are the preferred choice in practice due to their compact representation and cache-friendly access patterns.

We do not implement suffix arrays in this chapter, as their construction algorithms are more specialized. The key takeaway is that the trie concept extends naturally to substring search when applied to suffixes.

## Summary

A **trie** (prefix tree) is a tree-based data structure that stores strings by their character-by-character structure. Each path from the root to an end-of-word node represents a stored string, and strings that share a common prefix share the same initial path. This yields $O(m)$ lookup, insertion, and deletion, where $m$ is the key length — independent of the number of stored strings.

A **compressed trie** (radix tree) optimizes the standard trie by collapsing chains of single-child nodes into single edges labeled with substrings. This reduces the node count from $O(N)$ to $O(n)$, where $N$ is the total length of all stored strings and $n$ is the number of strings. The time complexity of all operations remains $O(m)$.

Tries are the natural choice for problems involving **prefix queries**: autocomplete, spell checking, IP routing, and predictive text. For **substring queries**, the trie concept extends to suffix trees and suffix arrays, which preprocess a text to enable fast pattern matching.

The trie is one of the most elegant examples of a data structure designed around the structure of the data it stores. Rather than treating keys as opaque objects to be compared or hashed, it decomposes keys into their constituent characters and exploits shared structure. This principle — designing data structures that respect the internal structure of their keys — is a powerful idea that appears throughout Computer Science.

## Exercises

**Exercise 19.1.** Insert the words "bear", "bell", "bid", "bull", "buy", "sell", "stock", "stop" into an empty trie. Draw the resulting trie and count the total number of nodes (including the root). Then repeat the exercise with a compressed trie and compare the node counts.

**Exercise 19.2.** A standard trie over an alphabet of size $|\Sigma|$ with $n$ stored words has at most $N + 1$ nodes (where $N$ is the total number of characters). Prove that a compressed trie has at most $2n + 1$ nodes. (_Hint: every internal node except the root has at least two children, and there are exactly $n$ leaves._)

**Exercise 19.3.** Modify the `Trie` class to support **wildcard search**: `search("b.ll")` should match "ball", "bell", "bill", "bull", etc., where `.` matches any single character. What is the time complexity of your solution?

**Exercise 19.4.** You are designing an autocomplete system for a search engine. Each query has an associated frequency count. Describe how to modify the trie to return the top-$k$ most frequent completions of a prefix efficiently. What data would you store at each node? What is the time complexity?

(_Hint: consider storing the top-$k$ completions at each node, or augmenting the trie with a priority queue._)

**Exercise 19.5.** An IP routing table contains the following prefixes (in binary): "0", "01", "011", "1", "10", "100", "1000". Build a compressed trie for these prefixes. Given the IP address "10010110" (in binary), trace the longest-prefix-match lookup and identify which prefix matches.
