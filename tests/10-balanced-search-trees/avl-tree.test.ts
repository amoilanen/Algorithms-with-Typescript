import { describe, it, expect } from 'vitest';
import { AVLTree } from '../../src/10-balanced-search-trees/avl-tree.js';

/**
 * Verify the AVL invariant: for every node, |height(left) − height(right)| ≤ 1.
 *
 * Walks the tree using the level-order traversal to access nodes, then checks
 * the tree height stays logarithmic.  Because the internal node structure is
 * not exposed, we verify the invariant indirectly by checking:
 *   1. In-order traversal is sorted (BST property).
 *   2. Tree height ≤ 1.44 log₂(n + 2) (AVL height bound).
 */
function verifyAVLInvariant(tree: AVLTree<number>): void {
  const sorted = tree.inorder();
  for (let i = 1; i < sorted.length; i++) {
    expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
  }

  if (tree.size > 0) {
    // AVL height bound: h ≤ 1.44 * log₂(n + 2) − 0.328
    const maxHeight = 1.44 * Math.log2(tree.size + 2);
    expect(tree.height()).toBeLessThanOrEqual(maxHeight);
  }
}

describe('AVLTree', () => {
  describe('empty tree', () => {
    it('should start empty', () => {
      const tree = new AVLTree<number>();
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    it('should return empty arrays for traversals', () => {
      const tree = new AVLTree<number>();
      expect(tree.inorder()).toEqual([]);
      expect(tree.preorder()).toEqual([]);
      expect(tree.postorder()).toEqual([]);
      expect(tree.levelOrder()).toEqual([]);
    });

    it('should return undefined for min and max', () => {
      const tree = new AVLTree<number>();
      expect(tree.min()).toBeUndefined();
      expect(tree.max()).toBeUndefined();
    });

    it('should return null for search', () => {
      const tree = new AVLTree<number>();
      expect(tree.search(5)).toBeNull();
      expect(tree.has(5)).toBe(false);
    });

    it('should have height -1', () => {
      const tree = new AVLTree<number>();
      expect(tree.height()).toBe(-1);
    });

    it('should return false for delete', () => {
      const tree = new AVLTree<number>();
      expect(tree.delete(5)).toBe(false);
    });
  });

  describe('single node', () => {
    it('should have size 1 after one insert', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      expect(tree.size).toBe(1);
      expect(tree.isEmpty).toBe(false);
    });

    it('should find the inserted value', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      expect(tree.has(10)).toBe(true);
      expect(tree.has(5)).toBe(false);
    });

    it('should return the value for min and max', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      expect(tree.min()).toBe(10);
      expect(tree.max()).toBe(10);
    });

    it('should have height 0', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      expect(tree.height()).toBe(0);
    });

    it('should have no successor or predecessor', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      expect(tree.successor(10)).toBeUndefined();
      expect(tree.predecessor(10)).toBeUndefined();
    });

    it('should delete the only node', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      expect(tree.delete(10)).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.has(10)).toBe(false);
    });
  });

  describe('rotations — insert sequences that trigger all 4 rotation types', () => {
    it('should handle Left-Left case (right rotation)', () => {
      // Inserting 30, 20, 10 creates a left-skewed chain
      //     30           20
      //    /            /  \
      //   20    →     10    30
      //  /
      // 10
      const tree = new AVLTree<number>();
      tree.insert(30);
      tree.insert(20);
      tree.insert(10);

      expect(tree.inorder()).toEqual([10, 20, 30]);
      expect(tree.height()).toBe(1); // balanced after rotation
      verifyAVLInvariant(tree);
    });

    it('should handle Right-Right case (left rotation)', () => {
      // Inserting 10, 20, 30 creates a right-skewed chain
      //   10             20
      //     \           /  \
      //      20   →   10    30
      //        \
      //         30
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(20);
      tree.insert(30);

      expect(tree.inorder()).toEqual([10, 20, 30]);
      expect(tree.height()).toBe(1);
      verifyAVLInvariant(tree);
    });

    it('should handle Left-Right case (double rotation)', () => {
      // Inserting 30, 10, 20 creates a left-right zig-zag
      //     30           20
      //    /            /  \
      //   10    →     10    30
      //     \
      //      20
      const tree = new AVLTree<number>();
      tree.insert(30);
      tree.insert(10);
      tree.insert(20);

      expect(tree.inorder()).toEqual([10, 20, 30]);
      expect(tree.height()).toBe(1);
      verifyAVLInvariant(tree);
    });

    it('should handle Right-Left case (double rotation)', () => {
      // Inserting 10, 30, 20 creates a right-left zig-zag
      //   10             20
      //     \           /  \
      //      30   →   10    30
      //     /
      //    20
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(30);
      tree.insert(20);

      expect(tree.inorder()).toEqual([10, 20, 30]);
      expect(tree.height()).toBe(1);
      verifyAVLInvariant(tree);
    });
  });

  describe('insert and balance', () => {
    it('should keep the tree balanced after sequential insertions', () => {
      const tree = new AVLTree<number>();
      // Sequential insert (worst case for plain BST)
      for (let i = 1; i <= 15; i++) tree.insert(i);

      expect(tree.size).toBe(15);
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      // A plain BST would have height 14; AVL should have height ≤ 4
      expect(tree.height()).toBeLessThanOrEqual(4);
      verifyAVLInvariant(tree);
    });

    it('should keep the tree balanced after reverse sequential insertions', () => {
      const tree = new AVLTree<number>();
      for (let i = 15; i >= 1; i--) tree.insert(i);

      expect(tree.size).toBe(15);
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      expect(tree.height()).toBeLessThanOrEqual(4);
      verifyAVLInvariant(tree);
    });

    it('should maintain BST property', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.insert(7);
      tree.insert(12);
      tree.insert(20);

      expect(tree.inorder()).toEqual([3, 5, 7, 10, 12, 15, 20]);
      expect(tree.size).toBe(7);
      verifyAVLInvariant(tree);
    });

    it('should find all inserted values', () => {
      const tree = new AVLTree<number>();
      const values = [10, 5, 15, 3, 7, 12, 20];
      for (const v of values) tree.insert(v);

      for (const v of values) {
        expect(tree.has(v)).toBe(true);
      }
      expect(tree.has(999)).toBe(false);
      expect(tree.has(0)).toBe(false);
    });
  });

  describe('duplicate handling', () => {
    it('should allow duplicate values', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(10);
      tree.insert(10);

      expect(tree.size).toBe(3);
      expect(tree.inorder()).toEqual([10, 10, 10]);
      verifyAVLInvariant(tree);
    });

    it('should delete only one occurrence of a duplicate', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(10);

      expect(tree.delete(10)).toBe(true);
      expect(tree.size).toBe(2);
      expect(tree.has(10)).toBe(true);
      verifyAVLInvariant(tree);
    });
  });

  describe('min and max', () => {
    it('should return correct min and max', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);
      tree.insert(20);

      expect(tree.min()).toBe(3);
      expect(tree.max()).toBe(20);
    });

    it('should update after deletions', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);

      tree.delete(5);
      expect(tree.min()).toBe(10);

      tree.delete(15);
      expect(tree.max()).toBe(10);
    });
  });

  describe('successor and predecessor', () => {
    function buildTree(): AVLTree<number> {
      const tree = new AVLTree<number>();
      for (const v of [10, 5, 15, 3, 7, 12, 20]) tree.insert(v);
      return tree;
    }

    it('should find the successor of each node', () => {
      const tree = buildTree();
      expect(tree.successor(3)).toBe(5);
      expect(tree.successor(5)).toBe(7);
      expect(tree.successor(7)).toBe(10);
      expect(tree.successor(10)).toBe(12);
      expect(tree.successor(12)).toBe(15);
      expect(tree.successor(15)).toBe(20);
      expect(tree.successor(20)).toBeUndefined();
    });

    it('should find the predecessor of each node', () => {
      const tree = buildTree();
      expect(tree.predecessor(3)).toBeUndefined();
      expect(tree.predecessor(5)).toBe(3);
      expect(tree.predecessor(7)).toBe(5);
      expect(tree.predecessor(10)).toBe(7);
      expect(tree.predecessor(12)).toBe(10);
      expect(tree.predecessor(15)).toBe(12);
      expect(tree.predecessor(20)).toBe(15);
    });

    it('should return undefined for values not in tree', () => {
      const tree = buildTree();
      expect(tree.successor(99)).toBeUndefined();
      expect(tree.predecessor(99)).toBeUndefined();
    });
  });

  describe('delete with rebalancing', () => {
    it('should delete a leaf node and rebalance', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(3);

      expect(tree.delete(15)).toBe(true);
      expect(tree.size).toBe(3);
      expect(tree.has(15)).toBe(false);
      expect(tree.inorder()).toEqual([3, 5, 10]);
      verifyAVLInvariant(tree);
    });

    it('should delete a node with one child and rebalance', () => {
      const tree = new AVLTree<number>();
      for (const v of [10, 5, 15, 3, 7, 12, 20, 1]) tree.insert(v);

      expect(tree.delete(3)).toBe(true);
      expect(tree.inorder()).toEqual([1, 5, 7, 10, 12, 15, 20]);
      verifyAVLInvariant(tree);
    });

    it('should delete a node with two children and rebalance', () => {
      const tree = new AVLTree<number>();
      for (const v of [10, 5, 15, 3, 7, 12, 20]) tree.insert(v);

      expect(tree.delete(5)).toBe(true);
      expect(tree.size).toBe(6);
      expect(tree.inorder()).toEqual([3, 7, 10, 12, 15, 20]);
      verifyAVLInvariant(tree);
    });

    it('should delete the root and rebalance', () => {
      const tree = new AVLTree<number>();
      for (const v of [10, 5, 15, 3, 7, 12, 20]) tree.insert(v);

      expect(tree.delete(10)).toBe(true);
      expect(tree.size).toBe(6);
      const sorted = tree.inorder();
      expect(sorted).toEqual([3, 5, 7, 12, 15, 20]);
      verifyAVLInvariant(tree);
    });

    it('should handle deleting non-existent value', () => {
      const tree = new AVLTree<number>();
      tree.insert(10);
      expect(tree.delete(99)).toBe(false);
      expect(tree.size).toBe(1);
    });

    it('should handle deleting all nodes one by one', () => {
      const tree = new AVLTree<number>();
      const values = [10, 5, 15, 3, 7, 12, 20];
      for (const v of values) tree.insert(v);

      for (const v of values) {
        expect(tree.delete(v)).toBe(true);
        verifyAVLInvariant(tree);
      }
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
      expect(tree.inorder()).toEqual([]);
    });

    it('should rebalance after deletion causes imbalance', () => {
      // Build a tree where deleting a leaf triggers a rotation
      //       5
      //      / \
      //     3   8
      //    /   / \
      //   1   7   9
      //
      // Deleting 1 makes left subtree shorter, but tree stays balanced.
      // Then delete 3 → left-heavy fix needed.
      const tree = new AVLTree<number>();
      for (const v of [5, 3, 8, 1, 7, 9]) tree.insert(v);
      tree.delete(1);
      tree.delete(3);

      expect(tree.inorder()).toEqual([5, 7, 8, 9]);
      verifyAVLInvariant(tree);
    });
  });

  describe('traversals', () => {
    function buildTree(): AVLTree<number> {
      const tree = new AVLTree<number>();
      // Insert in an order that produces a known balanced structure
      for (const v of [4, 2, 6, 1, 3, 5, 7]) tree.insert(v);
      return tree;
    }

    it('should produce sorted inorder traversal', () => {
      const tree = buildTree();
      expect(tree.inorder()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should produce valid preorder traversal', () => {
      const tree = buildTree();
      const pre = tree.preorder();
      expect(pre.length).toBe(7);
      // Root should come first
      expect(pre[0]).toBe(4);
    });

    it('should produce valid postorder traversal', () => {
      const tree = buildTree();
      const post = tree.postorder();
      expect(post.length).toBe(7);
      // Root should come last
      expect(post[6]).toBe(4);
    });

    it('should produce valid level-order traversal', () => {
      const tree = buildTree();
      const level = tree.levelOrder();
      expect(level.length).toBe(7);
      // Root should come first
      expect(level[0]).toBe(4);
    });
  });

  describe('custom comparator (strings)', () => {
    it('should work with string comparator', () => {
      const tree = new AVLTree<string>((a, b) => a.localeCompare(b));
      tree.insert('mango');
      tree.insert('apple');
      tree.insert('pear');
      tree.insert('banana');

      expect(tree.inorder()).toEqual(['apple', 'banana', 'mango', 'pear']);
      expect(tree.min()).toBe('apple');
      expect(tree.max()).toBe('pear');
      expect(tree.has('banana')).toBe(true);
      expect(tree.has('cherry')).toBe(false);
    });

    it('should support successor/predecessor with strings', () => {
      const tree = new AVLTree<string>((a, b) => a.localeCompare(b));
      tree.insert('mango');
      tree.insert('apple');
      tree.insert('pear');
      tree.insert('banana');

      expect(tree.successor('apple')).toBe('banana');
      expect(tree.predecessor('pear')).toBe('mango');
    });
  });

  describe('large dataset', () => {
    it('should handle 1000 sequential insertions and remain balanced', () => {
      const tree = new AVLTree<number>();
      for (let i = 0; i < 1000; i++) tree.insert(i);

      expect(tree.size).toBe(1000);
      verifyAVLInvariant(tree);

      const sorted = tree.inorder();
      for (let i = 0; i < 1000; i++) {
        expect(sorted[i]).toBe(i);
      }
    });

    it('should handle 1000 random insertions and remain balanced', () => {
      const tree = new AVLTree<number>();
      const values: number[] = [];
      for (let i = 0; i < 1000; i++) {
        values.push(Math.floor(Math.random() * 10000));
      }
      for (const v of values) tree.insert(v);

      expect(tree.size).toBe(1000);
      verifyAVLInvariant(tree);

      const sorted = tree.inorder();
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
      }
    });

    it('should handle many insertions and deletions', () => {
      const tree = new AVLTree<number>();
      for (let i = 0; i < 100; i++) tree.insert(i);
      expect(tree.size).toBe(100);

      // Delete even numbers
      for (let i = 0; i < 100; i += 2) {
        expect(tree.delete(i)).toBe(true);
        verifyAVLInvariant(tree);
      }
      expect(tree.size).toBe(50);

      const remaining = tree.inorder();
      expect(remaining.length).toBe(50);
      for (let i = 0; i < remaining.length; i++) {
        expect(remaining[i]).toBe(i * 2 + 1);
      }
    });
  });
});
