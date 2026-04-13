/**
 * Binary Tree Level Order Traversal
 * Difficulty: Medium
 * 
 * Given the root of a binary tree, return the level
 * order traversal of its nodes' values (BFS).
 * 
 * Example:
 *   Input: [3,9,20,null,null,15,7]
 *   Output: [[3],[9,20],[15,7]]
 */

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}

// Test
const root = new TreeNode(3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);
console.log(levelOrder(root));  // [[3], [9, 20], [15, 7]]
