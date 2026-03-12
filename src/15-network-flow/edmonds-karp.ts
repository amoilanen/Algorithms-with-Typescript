/**
 * Edmonds-Karp algorithm for computing the maximum flow in a flow network.
 *
 * The Edmonds-Karp algorithm is a specific implementation of the Ford-Fulkerson
 * method that uses BFS to find augmenting paths from the source to the sink.
 * By always choosing the shortest augmenting path (fewest edges), it guarantees
 * a polynomial time bound of O(VE²).
 *
 * The algorithm maintains a **residual graph** that tracks remaining capacity
 * on forward edges and flow that can be "pushed back" on reverse edges. At each
 * iteration, BFS finds a shortest augmenting path in the residual graph, and
 * the flow is augmented by the bottleneck capacity along that path.
 *
 * ### Complexity
 * - Time:  O(V · E²)
 * - Space: O(V + E) for the residual graph and BFS structures
 *
 * @module
 */

/**
 * A flow assignment on a single edge: the capacity and the actual flow.
 */
export interface FlowEdge<T> {
  from: T;
  to: T;
  capacity: number;
  flow: number;
}

/**
 * Result of the Edmonds-Karp max-flow computation.
 *
 * - `maxFlow`   — the total flow from source to sink.
 * - `flowEdges` — the flow assignment on each original edge.
 * - `minCut`    — the set of vertices reachable from `source` in the final
 *                 residual graph (the source side of the minimum cut).
 */
export interface MaxFlowResult<T> {
  maxFlow: number;
  flowEdges: FlowEdge<T>[];
  minCut: Set<T>;
}

/**
 * Internal representation of the residual graph using adjacency lists.
 *
 * Each entry in `capacity` stores the residual capacity of an edge.
 * Forward edges start with the original capacity; reverse edges start at 0.
 *
 * Vertices of any type are mapped to sequential integer IDs so that edge
 * keys can be computed without relying on `String()` (which would break
 * for object-valued vertices).
 */
class ResidualGraph<T> {
  /** adjacency list: vertex → set of neighbors in residual graph */
  private adj = new Map<T, Set<T>>();
  /** residual capacity keyed by packed integer pair */
  private cap = new Map<number, number>();
  /** original total capacity keyed by packed integer pair */
  private origCap = new Map<number, number>();
  /** vertex → unique integer id */
  private idOf = new Map<T, number>();
  private nextId = 0;

  private getId(v: T): number {
    let id = this.idOf.get(v);
    if (id === undefined) {
      id = this.nextId++;
      this.idOf.set(v, id);
    }
    return id;
  }

  /**
   * Pack two vertex ids into a single number for use as a Map key.
   * We use Cantor pairing which is safe for non-negative integers.
   */
  private pairKey(a: number, b: number): number {
    return ((a + b) * (a + b + 1)) / 2 + b;
  }

  addVertex(v: T): void {
    if (!this.adj.has(v)) {
      this.adj.set(v, new Set());
      this.getId(v); // ensure id is assigned
    }
  }

  /**
   * Add an edge with the given capacity. If the edge already exists, the
   * capacity is added to the existing capacity (supporting parallel edges
   * in the original network by merging them).
   */
  addEdge(from: T, to: T, capacity: number): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adj.get(from)!.add(to);
    // Ensure the reverse edge exists in the adjacency list (for residual flow).
    this.adj.get(to)!.add(from);

    const fwdKey = this.pairKey(this.getId(from), this.getId(to));
    this.cap.set(fwdKey, (this.cap.get(fwdKey) ?? 0) + capacity);
    this.origCap.set(fwdKey, (this.origCap.get(fwdKey) ?? 0) + capacity);

    // Initialize reverse edge capacity to 0 if it doesn't exist.
    const revKey = this.pairKey(this.getId(to), this.getId(from));
    if (!this.cap.has(revKey)) {
      this.cap.set(revKey, 0);
      this.origCap.set(revKey, 0);
    }
  }

  getResidualCapacity(from: T, to: T): number {
    return this.cap.get(this.pairKey(this.getId(from), this.getId(to))) ?? 0;
  }

  getOriginalCapacity(from: T, to: T): number {
    return this.origCap.get(this.pairKey(this.getId(from), this.getId(to))) ?? 0;
  }

  /**
   * Push `amount` units of flow along the edge from → to.
   * Decreases forward residual capacity and increases reverse residual capacity.
   */
  pushFlow(from: T, to: T, amount: number): void {
    const fwdKey = this.pairKey(this.getId(from), this.getId(to));
    const revKey = this.pairKey(this.getId(to), this.getId(from));
    this.cap.set(fwdKey, this.cap.get(fwdKey)! - amount);
    this.cap.set(revKey, this.cap.get(revKey)! + amount);
  }

  getNeighbors(v: T): Set<T> {
    return this.adj.get(v) ?? new Set();
  }

  /**
   * BFS from `source` to `sink` in the residual graph.
   * Returns the parent map if a path is found, or `null` otherwise.
   */
  bfs(source: T, sink: T): Map<T, T | null> | null {
    const parent = new Map<T, T | null>();
    parent.set(source, null);

    const queue: T[] = [source];
    let head = 0;

    while (head < queue.length) {
      const u = queue[head++]!;

      if (u === sink) return parent;

      for (const v of this.getNeighbors(u)) {
        if (!parent.has(v) && this.getResidualCapacity(u, v) > 0) {
          parent.set(v, u);
          queue.push(v);
        }
      }
    }

    return null; // sink not reachable
  }
}

/**
 * Compute the maximum flow from `source` to `sink` in a directed flow network
 * using the Edmonds-Karp algorithm (BFS-based Ford-Fulkerson).
 *
 * The input is specified as a list of directed edges with capacities. Vertices
 * are inferred from the edge endpoints. Parallel edges between the same pair
 * of vertices are supported (their capacities are summed).
 *
 * @param edges    Array of `{ from, to, capacity }` describing the flow network.
 * @param source   The source vertex.
 * @param sink     The sink vertex.
 * @returns A {@link MaxFlowResult} with the max flow value, per-edge flows,
 *          and the min-cut vertex set.
 * @throws {Error} If source equals sink.
 */
export function edmondsKarp<T>(
  edges: { from: T; to: T; capacity: number }[],
  source: T,
  sink: T,
): MaxFlowResult<T> {
  if (source === sink) {
    throw new Error('Source and sink must be different vertices');
  }

  // Build the residual graph.
  const residual = new ResidualGraph<T>();
  residual.addVertex(source);
  residual.addVertex(sink);

  for (const { from, to, capacity } of edges) {
    residual.addEdge(from, to, capacity);
  }

  let maxFlow = 0;

  // Repeatedly find shortest augmenting paths via BFS.
  while (true) {
    const parent = residual.bfs(source, sink);
    if (parent === null) break; // No augmenting path — we're done.

    // Find the bottleneck capacity along the path.
    let bottleneck = Infinity;
    let v: T = sink;
    while (v !== source) {
      const u = parent.get(v) as T;
      bottleneck = Math.min(bottleneck, residual.getResidualCapacity(u, v));
      v = u;
    }

    // Augment flow along the path.
    v = sink;
    while (v !== source) {
      const u = parent.get(v) as T;
      residual.pushFlow(u, v, bottleneck);
      v = u;
    }

    maxFlow += bottleneck;
  }

  // Build the flow assignment for original edges.
  // Flow on an original edge (u, v) = originalCapacity(u, v) - residualCapacity(u, v).
  // When parallel edges exist, total flow for a (u, v) pair is distributed
  // greedily across the original edges (fill each up to its capacity).
  //
  // Group edges by identity-safe (from, to) pairs using a Map keyed by the
  // actual vertex references.
  const pairFlow = new Map<T, Map<T, number>>();

  const getPairFlow = (from: T, to: T): number => {
    let innerMap = pairFlow.get(from);
    if (!innerMap) {
      innerMap = new Map();
      pairFlow.set(from, innerMap);
    }
    let flow = innerMap.get(to);
    if (flow === undefined) {
      const origCap = residual.getOriginalCapacity(from, to);
      const resCap = residual.getResidualCapacity(from, to);
      flow = origCap - resCap;
      innerMap.set(to, flow);
    }
    return flow;
  };

  const usedFlow = new Map<T, Map<T, number>>();

  const getUsed = (from: T, to: T): number => {
    return usedFlow.get(from)?.get(to) ?? 0;
  };

  const addUsed = (from: T, to: T, amount: number): void => {
    let innerMap = usedFlow.get(from);
    if (!innerMap) {
      innerMap = new Map();
      usedFlow.set(from, innerMap);
    }
    innerMap.set(to, (innerMap.get(to) ?? 0) + amount);
  };

  const flowEdges: FlowEdge<T>[] = [];
  for (const { from, to, capacity } of edges) {
    const totalFlow = getPairFlow(from, to);
    const remaining = totalFlow - getUsed(from, to);
    const edgeFlow = Math.min(capacity, Math.max(0, remaining));
    flowEdges.push({ from, to, capacity, flow: edgeFlow });
    addUsed(from, to, edgeFlow);
  }

  // Compute the minimum cut: vertices reachable from source in the final
  // residual graph (the source side of the min s-t cut).
  const minCut = new Set<T>();
  minCut.add(source);
  const queue: T[] = [source];
  let head = 0;
  while (head < queue.length) {
    const u = queue[head++]!;
    for (const v of residual.getNeighbors(u)) {
      if (!minCut.has(v) && residual.getResidualCapacity(u, v) > 0) {
        minCut.add(v);
        queue.push(v);
      }
    }
  }

  return { maxFlow, flowEdges, minCut };
}
