/**
 * Union-Find (Disjoint Set Union) data structure with **path compression**
 * and **union by rank**.
 *
 * Maintains a collection of disjoint sets and supports two primary
 * operations:
 *
 * - **find(x)** — determine which set element `x` belongs to (returns the
 *   set representative).
 * - **union(x, y)** — merge the sets containing `x` and `y`.
 *
 * With both path compression and union by rank, any sequence of *m*
 * operations on *n* elements runs in O(m · α(n)) time, where α is the
 * extremely slow-growing inverse Ackermann function — effectively O(1)
 * amortized per operation.
 *
 * ### Complexity
 * | Operation   | Amortized Time |
 * |-------------|---------------|
 * | makeSet     | O(1)          |
 * | find        | O(α(n)) ≈ O(1) |
 * | union       | O(α(n)) ≈ O(1) |
 * | connected   | O(α(n)) ≈ O(1) |
 */
export class UnionFind<T> {
  private parent = new Map<T, T>();
  private rank = new Map<T, number>();
  private _componentCount = 0;

  /**
   * Create a new singleton set containing `x`.
   *
   * If `x` is already in a set, this is a no-op.
   */
  makeSet(x: T): void {
    if (this.parent.has(x)) return;
    this.parent.set(x, x);
    this.rank.set(x, 0);
    this._componentCount++;
  }

  /**
   * Find the representative (root) of the set containing `x`.
   *
   * Uses **path compression**: every node on the path from `x` to the root
   * is made to point directly at the root, flattening the tree for future
   * queries.
   *
   * @throws {Error} If `x` has not been added via {@link makeSet}.
   */
  find(x: T): T {
    if (!this.parent.has(x)) {
      throw new Error(`Element not found in any set`);
    }

    let root = x;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }

    // Path compression — point every node on the path directly to root.
    let current = x;
    while (current !== root) {
      const next = this.parent.get(current)!;
      this.parent.set(current, root);
      current = next;
    }

    return root;
  }

  /**
   * Merge the sets containing `x` and `y`.
   *
   * Uses **union by rank**: the shorter tree is attached beneath the taller
   * one, keeping trees shallow.
   *
   * @returns `true` if a merge actually happened (i.e., `x` and `y` were
   *          in different sets), `false` if they were already in the same set.
   * @throws {Error} If either `x` or `y` has not been added via {@link makeSet}.
   */
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

  /**
   * Whether `x` and `y` belong to the same set.
   */
  connected(x: T, y: T): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * The number of disjoint sets (connected components).
   */
  get componentCount(): number {
    return this._componentCount;
  }

  /**
   * The total number of elements across all sets.
   */
  get size(): number {
    return this.parent.size;
  }
}
