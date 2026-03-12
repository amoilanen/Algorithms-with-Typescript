# Disjoint Sets

_In Chapter 14 we introduced the **Union-Find** data structure as a tool for Kruskal's minimum spanning tree algorithm. We showed the code and stated that, with path compression and union by rank, each operation runs in amortized near-constant time. In this chapter we give the data structure the thorough treatment it deserves: we motivate the problem, build up from naive solutions, add the two key optimizations one at a time, explain why the combined structure achieves its remarkable $O(\alpha(n))$ amortized bound, and survey the wide range of problems where Union-Find is the right tool._

## The disjoint-set problem

Many algorithms need to maintain a collection of **disjoint sets** — a partition of elements into non-overlapping groups — and answer questions about which group an element belongs to. The **disjoint-set** (or **union-find**) abstract data type supports three operations:

- **makeSet(x)** — create a new set containing only $x$.
- **find(x)** — return the **representative** (canonical element) of the set containing $x$. Two elements are in the same set if and only if `find` returns the same representative.
- **union(x, y)** — merge the set containing $x$ and the set containing $y$ into a single set.

A sequence of $n$ `makeSet` operations followed by $m$ `find` and `union` operations is called an **intermixed sequence** of length $n + m$. Our goal is a data structure that processes the entire sequence as quickly as possible.

### Where disjoint sets arise

The disjoint-set problem appears in a surprising number of settings:

- **Kruskal's MST algorithm** (Chapter 14): determine whether adding an edge creates a cycle by checking if two vertices are already in the same component, and merge components when an edge is added.
- **Dynamic connectivity**: given a stream of edge insertions in an undirected graph, answer "Are vertices $u$ and $v$ connected?" after each insertion.
- **Image processing**: in connected-component labeling, pixels are grouped into regions by unioning adjacent pixels that satisfy a similarity criterion.
- **Equivalence classes**: in compilers, type unification during type inference is modeled as a union-find problem.
- **Percolation**: in physics simulations, determining whether a path exists from top to bottom of a grid is equivalent to checking whether top-row and bottom-row elements share a component.
- **Least common ancestors** (offline): Tarjan's offline LCA algorithm uses union-find to batch-process ancestor queries on a tree.
- **Network redundancy**: determining the number of connected components in a network, or detecting when a network becomes fully connected.

## Naive implementations

Before introducing the optimized structure, let us consider two naive approaches. Each is fast for one operation but slow for the other, and understanding their limitations motivates the optimizations.

### Array-based (quick-find)

Store an array `id[]` where `id[x]` is the representative of $x$'s set. Two elements are in the same set if and only if they have the same `id` value.

- **find(x)** — return `id[x]`. This is $O(1)$.
- **union(x, y)** — scan the entire array, changing every entry equal to `id[x]` to `id[y]`. This is $O(n)$.

A sequence of $n - 1$ union operations (enough to merge $n$ singletons into one set) costs $O(n^2)$ time. For large $n$, this is too slow.

### Linked-list-based (quick-union, unoptimized)

Represent each set as a rooted tree using a `parent[]` array. The representative of a set is the root of its tree: the element $r$ with `parent[r] = r`.

- **find(x)** — follow parent pointers from $x$ to the root. Time is $O(d)$, where $d$ is the depth of $x$.
- **union(x, y)** — set `parent[find(x)] = find(y)`. This is $O(d_x + d_y)$.

The problem is that trees can become arbitrarily deep. If we perform $n - 1$ unions in an unlucky order — always attaching the larger tree beneath the smaller one's root — the tree degenerates into a chain of length $n$, and `find` costs $O(n)$. A sequence of $m$ `find` operations then costs $O(mn)$.

We need two ideas to fix this: **union by rank** to keep trees shallow, and **path compression** to flatten them over time.

## Union by rank

The first optimization controls tree height by always attaching the **shorter** tree beneath the **taller** one during a union.

Each node $x$ has a **rank** — an upper bound on the height of the subtree rooted at $x$. Initially, every node has rank 0 (it is a leaf). When we merge two trees:

- If the roots have different ranks, we attach the lower-rank root beneath the higher-rank root. The rank of the new root does not change.
- If the roots have equal rank $r$, we attach one beneath the other and increment the new root's rank to $r + 1$.

```
union(x, y):
    rootX = find(x)
    rootY = find(y)
    if rootX == rootY: return       // already same set
    if rank[rootX] < rank[rootY]:
        parent[rootX] = rootY
    else if rank[rootX] > rank[rootY]:
        parent[rootY] = rootX
    else:
        parent[rootY] = rootX
        rank[rootX] = rank[rootX] + 1
```

### Why union by rank helps

**Lemma.** With union by rank (and no path compression), a tree with root of rank $r$ contains at least $2^r$ nodes.

_Proof._ By induction on the number of union operations. Initially every node has rank 0 and its tree has $2^0 = 1$ node. The rank of a root increases from $r$ to $r + 1$ only when two trees of rank $r$ are merged. By the inductive hypothesis, each contains at least $2^r$ nodes, so the merged tree contains at least $2 \cdot 2^r = 2^{r+1}$ nodes. $\square$

**Corollary.** The maximum rank of any node is $\lfloor \log_2 n \rfloor$, where $n$ is the total number of elements.

This means that `find(x)` follows at most $\lfloor \log_2 n \rfloor$ parent pointers, so each `find` costs $O(\log n)$. A sequence of $m$ operations costs $O(m \log n)$ — already a major improvement over the naive $O(mn)$.

## Path compression

The second optimization speeds up `find` by making every node on the find path point directly to the root:

```
find(x):
    root = x
    while parent[root] != root:
        root = parent[root]
    // Path compression: point every node on path directly to root
    while x != root:
        next = parent[x]
        parent[x] = root
        x = next
    return root
```

After `find(x)` completes, every node that was between $x$ and the root now has the root as its immediate parent. Future `find` operations on any of these nodes will complete in a single step.

Path compression alone (without union by rank) already achieves $O(\log n)$ amortized time per operation. But the real power comes from combining both optimizations.

### A variant: path halving

An alternative to full path compression is **path halving**, where each node on the find path is made to skip its parent and point to its grandparent:

```
find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   // skip to grandparent
        x = parent[x]
    return x
```

Path halving achieves the same asymptotic amortized bound as full path compression and requires only a single pass through the path (no second loop). In practice, both variants perform similarly.

## Combined complexity: the inverse Ackermann function

With both path compression and union by rank, any sequence of $m$ operations on $n$ elements runs in $O(m \cdot \alpha(n))$ time, where $\alpha$ is the **inverse Ackermann function**. This remarkable result was proved by Tarjan in 1975 and later tightened by Tarjan and van Leeuwen.

### What is the Ackermann function?

The **Ackermann function** $A(k, j)$ is defined recursively:

$$A(0, j) = j + 1$$
$$A(k, 0) = A(k - 1, 1) \quad \text{for } k \geq 1$$
$$A(k, j) = A(k - 1, A(k, j - 1)) \quad \text{for } k \geq 1, j \geq 1$$

This function grows extraordinarily fast. A few values:

| $k$ | $A(k, 1)$ |
|-----|-----------|
| 0 | 2 |
| 1 | 3 |
| 2 | 5 |
| 3 | 13 |
| 4 | 65533 |
| 5 | $2^{2^{2^{\cdots}}} - 3$ (a tower of 65536 twos) |

The value $A(5, 1)$ is so large that it dwarfs the number of atoms in the observable universe ($\approx 10^{80}$).

### The inverse Ackermann function

The **inverse Ackermann function** $\alpha(n)$ is defined as:

$$\alpha(n) = \min\{k : A(k, 1) \geq n\}$$

Since $A$ grows so fast, $\alpha$ grows inconceivably slowly:

- $\alpha(n) = 0$ for $n \leq 2$
- $\alpha(n) = 1$ for $n = 3$
- $\alpha(n) = 2$ for $4 \leq n \leq 5$
- $\alpha(n) = 3$ for $6 \leq n \leq 13$
- $\alpha(n) = 4$ for $14 \leq n \leq 65533$
- $\alpha(n) = 5$ for $65534 \leq n \leq A(5, 1)$

For any value of $n$ that could arise in practice — or indeed in any computation on physical hardware — $\alpha(n) \leq 4$. This is why we say union-find operations run in "effectively constant" amortized time.

### Intuition for the amortized bound

The formal proof uses a sophisticated potential function argument (originally due to Tarjan). Here is the intuition:

1. **Union by rank** ensures that tree heights are at most $O(\log n)$, so the "starting point" for find costs is logarithmic.

2. **Path compression** does not change ranks, so the rank-based height bound still holds as a worst case. However, after a find operation, the compressed nodes have much shorter paths to the root.

3. The key insight is that path compression "pays for itself." A find that traverses a long path is expensive, but it compresses that path, making all subsequent finds along it cheap. The total cost of $m$ finds, amortized, is only $O(m \cdot \alpha(n))$.

To formalize this, Tarjan defines a potential function based on how much "room" each node has for future compression. Each expensive find reduces the potential significantly, ensuring that the amortized cost per operation is bounded by $\alpha(n)$.

### Is this optimal?

Yes. Tarjan proved a matching lower bound: in the **pointer machine** model, any data structure for the disjoint-set problem requires $\Omega(m \cdot \alpha(n))$ time for a sequence of $m$ operations on $n$ elements. The union-find structure with path compression and union by rank is **asymptotically optimal**.

## Implementation

Our TypeScript implementation uses a `Map` for the parent and rank arrays, which allows the element type `T` to be any hashable value — not just integers.

```typescript
export class UnionFind<T> {
  private parent = new Map<T, T>();
  private rank = new Map<T, number>();
  private _componentCount = 0;

  makeSet(x: T): void {
    if (this.parent.has(x)) return;
    this.parent.set(x, x);
    this.rank.set(x, 0);
    this._componentCount++;
  }

  find(x: T): T {
    let root = x;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }
    // Path compression: point every node on path directly to root.
    let current = x;
    while (current !== root) {
      const next = this.parent.get(current)!;
      this.parent.set(current, root);
      current = next;
    }
    return root;
  }

  union(x: T, y: T): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;

    const rankX = this.rank.get(rootX)!;
    const rankY = this.rank.get(rootY)!;
    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
    this._componentCount--;
    return true;
  }

  connected(x: T, y: T): boolean {
    return this.find(x) === this.find(y);
  }

  get componentCount(): number {
    return this._componentCount;
  }

  get size(): number {
    return this.parent.size;
  }
}
```

### Design decisions

**Generic type parameter.** The `UnionFind<T>` class works with any element type — numbers, strings, or objects — as long as elements can be used as `Map` keys (i.e., identity via `===`). This is more flexible than an array-based implementation that requires elements to be integer indices.

**Idempotent `makeSet`.** Calling `makeSet(x)` when `x` is already in a set is a no-op. This simplifies client code that may process elements from an unknown source.

**Return value of `union`.** The method returns `true` if a merge actually happened and `false` if the elements were already in the same set. This is useful for Kruskal's algorithm, which needs to know whether an edge was added to the MST.

**Component count.** The `componentCount` property tracks the number of disjoint sets, which is useful for dynamic connectivity queries ("How many connected components remain?").

### Complexity summary

| Operation | Amortized Time |
|-----------|---------------|
| `makeSet` | $O(1)$ |
| `find` | $O(\alpha(n))$ |
| `union` | $O(\alpha(n))$ |
| `connected` | $O(\alpha(n))$ |

Space: $O(n)$ for $n$ elements.

## Trace through an example

Let us trace through a sequence of operations on integers $\{0, 1, 2, 3, 4, 5, 6, 7\}$. We show the parent array and rank array after each operation. An arrow $x \to y$ means `parent[x] = y`; a self-loop means $x$ is a root.

**After makeSet(0) through makeSet(7):**

```
parent: 0→0  1→1  2→2  3→3  4→4  5→5  6→6  7→7
rank:   0:0  1:0  2:0  3:0  4:0  5:0  6:0  7:0
components: 8
```

Every element is its own root with rank 0.

**union(0, 1):** Roots 0 and 1 both have rank 0, so attach 1 under 0. Increment rank of 0.

```
parent: 0→0  1→0  2→2  3→3  4→4  5→5  6→6  7→7
rank:   0:1  1:0  2:0  3:0  4:0  5:0  6:0  7:0
components: 7
```

**union(2, 3):** Attach 3 under 2. Increment rank of 2.

```
parent: 0→0  1→0  2→2  3→2  4→4  5→5  6→6  7→7
rank:   0:1  1:0  2:1  3:0  4:0  5:0  6:0  7:0
components: 6
```

**union(4, 5):** Attach 5 under 4.

```
parent: 0→0  1→0  2→2  3→2  4→4  5→4  6→6  7→7
rank:   0:1  1:0  2:1  3:0  4:1  5:0  6:0  7:0
components: 5
```

**union(6, 7):** Attach 7 under 6.

```
parent: 0→0  1→0  2→2  3→2  4→4  5→4  6→6  7→6
rank:   0:1  1:0  2:1  3:0  4:1  5:0  6:1  7:0
components: 4
```

**union(0, 2):** Roots 0 and 2 both have rank 1. Attach 2 under 0. Increment rank of 0.

```
parent: 0→0  1→0  2→0  3→2  4→4  5→4  6→6  7→6
rank:   0:2  1:0  2:1  3:0  4:1  5:0  6:1  7:0
components: 3
```

**union(4, 6):** Roots 4 and 6 both have rank 1. Attach 6 under 4.

```
parent: 0→0  1→0  2→0  3→2  4→4  5→4  6→4  7→6
rank:   0:2  1:0  2:1  3:0  4:2  5:0  6:1  7:0
components: 2
```

**union(0, 4):** Roots 0 and 4 both have rank 2. Attach 4 under 0.

```
parent: 0→0  1→0  2→0  3→2  4→0  5→4  6→4  7→6
rank:   0:3  1:0  2:1  3:0  4:2  5:0  6:1  7:0
components: 1
```

**find(7):** Follow the path $7 \to 6 \to 4 \to 0$. The root is 0. Path compression sets `parent[7] = 0`, `parent[6] = 0`, and `parent[4] = 0` (4 was already pointing to 0).

```
parent: 0→0  1→0  2→0  3→2  4→0  5→4  6→0  7→0
rank:   (unchanged — path compression does not alter ranks)
```

After this find, the next call to `find(7)` completes in a single step.

**find(3):** Follow $3 \to 2 \to 0$. Path compression sets `parent[3] = 0`.

```
parent: 0→0  1→0  2→0  3→0  4→0  5→4  6→0  7→0
```

Now almost every node points directly to the root. The tree is nearly flat, and future finds will be very fast.

## Applications

### Kruskal's minimum spanning tree

The most classic application of Union-Find is in Kruskal's algorithm (Chapter 14). The algorithm sorts edges by weight and processes them in order. For each edge $(u, v)$:

1. Call `find(u)` and `find(v)` to check if $u$ and $v$ are in the same component.
2. If not, call `union(u, v)` and add the edge to the MST.

Without Union-Find, cycle detection would require a full graph traversal for each edge, costing $O(V + E)$ per edge and $O(E(V + E))$ overall. With Union-Find, the total cost of all find and union operations is $O(E \cdot \alpha(V))$, which is effectively $O(E)$.

### Dynamic connectivity

In the **dynamic connectivity** problem, we process a stream of edge insertions in an undirected graph and must answer connectivity queries: "Are vertices $u$ and $v$ connected?"

Union-Find handles this directly: when edge $(u, v)$ is inserted, call `union(u, v)`. To answer a connectivity query, call `connected(u, v)`. Each operation runs in amortized $O(\alpha(n))$ time.

Note that standard Union-Find only supports **incremental** connectivity — edges can be added but not removed. Supporting deletions requires more sophisticated data structures (such as link-cut trees or the Euler tour tree), which are beyond the scope of this book.

### Connected components in an image

In image processing, **connected-component labeling** groups pixels into regions. Two adjacent pixels are in the same component if they share some property (e.g., similar color).

The algorithm scans the image in raster order (left to right, top to bottom). For each pixel:

1. Call `makeSet` for the pixel.
2. Check the pixel above and to the left. If either neighbor has a similar value, call `union` to merge the current pixel's set with the neighbor's set.
3. After scanning the entire image, each connected component corresponds to one disjoint set.

This is the standard "two-pass" connected-component labeling algorithm. Union-Find makes the second pass (resolving label equivalences) nearly linear.

### Percolation

In a percolation simulation, we model a grid of cells where each cell is independently "open" with probability $p$ or "blocked" with probability $1 - p$. The question is: does an open path exist from the top row to the bottom row?

We model this with Union-Find:

1. Create a "virtual top" node connected to all open cells in the top row.
2. Create a "virtual bottom" node connected to all open cells in the bottom row.
3. For each open cell, union it with its open neighbors.
4. The system percolates if `connected(virtualTop, virtualBottom)`.

This allows efficient simulation of percolation for many values of $p$, enabling Monte Carlo estimation of the **percolation threshold** — the critical probability above which percolation almost certainly occurs.

## Union by rank vs. union by size

An alternative to union by rank is **union by size**, which attaches the tree with fewer nodes beneath the tree with more nodes. Both strategies achieve $O(\log n)$ height without path compression and $O(\alpha(n))$ amortized time with path compression. The choice between them is largely a matter of taste:

- **Union by rank** is slightly simpler because rank is a single integer that only increases, never decreases, and is never affected by path compression.
- **Union by size** provides additional information: after the union, the root's size equals the total number of elements in the merged set. This is useful when you need to know component sizes.

Our implementation uses union by rank, following the approach in CLRS.

## Exercises

**Exercise 18.1.** Starting from eight singleton sets $\{0\}, \{1\}, \ldots, \{7\}$, perform the following operations using union by rank and path compression. Draw the forest after each operation and show how path compression modifies the tree structure.

```
union(0, 1), union(2, 3), union(0, 2),
union(4, 5), union(6, 7), union(4, 6),
union(0, 4), find(7), find(3), find(5)
```

**Exercise 18.2.** Prove that with union by rank (without path compression), the rank of any root is at most $\lfloor \log_2 n \rfloor$. (_Hint: prove that a tree with root rank $r$ has at least $2^r$ nodes, by induction on the number of union operations._)

**Exercise 18.3.** Consider implementing union-find with path compression but **without** union by rank (i.e., always attaching the second root under the first, regardless of tree heights). What is the amortized time complexity per operation? Is it still $O(\alpha(n))$?

**Exercise 18.4.** Describe how to use Union-Find to detect whether an undirected graph has a cycle. Process the edges one by one; what condition indicates a cycle? Analyze the time complexity.

**Exercise 18.5.** A social network has $n$ users. Friendships arrive as a stream of pairs $(a, b)$. You want to determine the **exact moment** when all users become connected (directly or transitively). Describe an algorithm using Union-Find and analyze its complexity.

(_Hint: maintain a component count and check when it reaches 1._)

## Summary

The **disjoint-set** (Union-Find) data structure maintains a partition of elements into disjoint sets, supporting `makeSet`, `find`, and `union` operations. Naive implementations achieve at best $O(\log n)$ per operation (with union by rank alone) or $O(n)$ in the worst case (without any optimizations).

**Union by rank** keeps trees shallow by always attaching the shorter tree beneath the taller one, guaranteeing a maximum height of $O(\log n)$.

**Path compression** flattens trees during `find` operations by pointing every traversed node directly at the root, making subsequent finds faster.

Together, union by rank and path compression achieve $O(\alpha(n))$ amortized time per operation, where $\alpha$ is the inverse Ackermann function — a function so slow-growing that $\alpha(n) \leq 4$ for any practically conceivable input size. This bound is **optimal**: no pointer-based data structure can do better.

Union-Find is a fundamental building block in algorithm design. Its primary application is **Kruskal's MST algorithm** (Chapter 14), where it provides efficient cycle detection. It also appears in dynamic connectivity, image processing, percolation, type unification in compilers, and many other settings. In Chapter 22, we will see Union-Find used again in approximation algorithms for NP-hard problems.
