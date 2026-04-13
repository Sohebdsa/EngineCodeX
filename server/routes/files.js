import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.join(__dirname, '..', 'workspace');

export const filesRouter = express.Router();

// ─── Build directory tree recursively ───────────────────────────
function buildTree(dirPath, relativePath = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const children = [];

  // Sort: folders first, then files, alphabetically
  const sorted = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of sorted) {
    const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      children.push({
        name: entry.name,
        type: 'directory',
        path: entryRelPath,
        children: buildTree(path.join(dirPath, entry.name), entryRelPath),
      });
    } else {
      children.push({
        name: entry.name,
        type: 'file',
        path: entryRelPath,
      });
    }
  }
  return children;
}

// ─── GET /tree ──────────────────────────────────────────────────
filesRouter.get('/tree', (req, res) => {
  try {
    if (!fs.existsSync(WORKSPACE_ROOT)) {
      fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
    }
    const tree = buildTree(WORKSPACE_ROOT);
    res.json({ tree });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /read ─────────────────────────────────────────────────
filesRouter.post('/read', (req, res) => {
  try {
    const { path: filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: 'Path is required' });

    const absPath = path.join(WORKSPACE_ROOT, filePath);
    if (!absPath.startsWith(WORKSPACE_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(absPath, 'utf-8');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /write ────────────────────────────────────────────────
filesRouter.post('/write', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath) return res.status(400).json({ error: 'Path is required' });

    const absPath = path.join(WORKSPACE_ROOT, filePath);
    if (!absPath.startsWith(WORKSPACE_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content || '', 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /create ───────────────────────────────────────────────
filesRouter.post('/create', (req, res) => {
  try {
    const { path: filePath, type } = req.body;
    if (!filePath || !type) {
      return res.status(400).json({ error: 'Path and type are required' });
    }

    const absPath = path.join(WORKSPACE_ROOT, filePath);
    if (!absPath.startsWith(WORKSPACE_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (fs.existsSync(absPath)) {
      return res.status(409).json({ error: 'Already exists' });
    }

    if (type === 'directory') {
      fs.mkdirSync(absPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, '', 'utf-8');
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /rename ───────────────────────────────────────────────
filesRouter.post('/rename', (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'oldPath and newPath are required' });
    }

    const absOld = path.join(WORKSPACE_ROOT, oldPath);
    const absNew = path.join(WORKSPACE_ROOT, newPath);

    if (!absOld.startsWith(WORKSPACE_ROOT) || !absNew.startsWith(WORKSPACE_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!fs.existsSync(absOld)) {
      return res.status(404).json({ error: 'Source not found' });
    }

    fs.mkdirSync(path.dirname(absNew), { recursive: true });
    fs.renameSync(absOld, absNew);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /delete ─────────────────────────────────────────────
filesRouter.delete('/delete', (req, res) => {
  try {
    const { path: filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: 'Path is required' });

    const absPath = path.join(WORKSPACE_ROOT, filePath);
    if (!absPath.startsWith(WORKSPACE_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    fs.rmSync(absPath, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Seed workspace with sample DSA files ───────────────────────
export function seedWorkspace() {
  if (fs.existsSync(path.join(WORKSPACE_ROOT, 'DSA'))) {
    console.log('  📁 Workspace already seeded');
    return;
  }

  console.log('  🌱 Seeding workspace with sample DSA files...');

  const files = {
    'DSA/Arrays/two_sum.js': `/**
 * Two Sum
 * Difficulty: Easy
 * 
 * Given an array of integers nums and an integer target,
 * return indices of the two numbers such that they add up to target.
 * 
 * Example:
 *   Input: nums = [2,7,11,15], target = 9
 *   Output: [0,1]
 */

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));        // [1, 2]
`,

    'DSA/Arrays/maximum_subarray.js': `/**
 * Maximum Subarray (Kadane's Algorithm)
 * Difficulty: Medium
 * 
 * Given an integer array nums, find the subarray with
 * the largest sum, and return its sum.
 * 
 * Example:
 *   Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
 *   Output: 6 (subarray [4,-1,2,1])
 */

function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// Test
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));  // 6
console.log(maxSubArray([1]));                                  // 1
console.log(maxSubArray([5, 4, -1, 7, 8]));                    // 23
`,

    'DSA/Arrays/binary_search.js': `/**
 * Binary Search
 * Difficulty: Easy
 * 
 * Given a sorted array of integers and a target value,
 * return the index if found, otherwise return -1.
 * 
 * Example:
 *   Input: nums = [-1,0,3,5,9,12], target = 9
 *   Output: 4
 */

function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}

// Test
console.log(binarySearch([-1, 0, 3, 5, 9, 12], 9));   // 4
console.log(binarySearch([-1, 0, 3, 5, 9, 12], 2));   // -1
`,

    'DSA/Strings/valid_parentheses.js': `/**
 * Valid Parentheses
 * Difficulty: Easy
 * 
 * Given a string s containing just the characters
 * '(', ')', '{', '}', '[' and ']', determine if the
 * input string is valid.
 * 
 * Example:
 *   Input: s = "()[]{}"
 *   Output: true
 */

function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if ('({['.includes(char)) {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }

  return stack.length === 0;
}

// Test
console.log(isValid("()"));       // true
console.log(isValid("()[]{}"));   // true
console.log(isValid("(]"));       // false
console.log(isValid("([)]"));     // false
`,

    'DSA/Strings/valid_anagram.js': `/**
 * Valid Anagram
 * Difficulty: Easy
 * 
 * Given two strings s and t, return true if t is an
 * anagram of s, and false otherwise.
 * 
 * Example:
 *   Input: s = "anagram", t = "nagaram"
 *   Output: true
 */

function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  const count = {};
  for (const char of s) {
    count[char] = (count[char] || 0) + 1;
  }
  for (const char of t) {
    if (!count[char]) return false;
    count[char]--;
  }

  return true;
}

// Test
console.log(isAnagram("anagram", "nagaram"));  // true
console.log(isAnagram("rat", "car"));          // false
`,

    'DSA/LinkedList/reverse_linked_list.js': `/**
 * Reverse Linked List
 * Difficulty: Easy
 * 
 * Given the head of a singly linked list,
 * reverse the list, and return the reversed list.
 * 
 * Example:
 *   Input: 1 -> 2 -> 3 -> 4 -> 5
 *   Output: 5 -> 4 -> 3 -> 2 -> 1
 */

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  let current = head;

  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  return prev;
}

// Helper: array to linked list
function arrayToList(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) {
    head = new ListNode(arr[i], head);
  }
  return head;
}

// Helper: linked list to array
function listToArray(head) {
  const result = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  return result;
}

// Test
const list = arrayToList([1, 2, 3, 4, 5]);
console.log(listToArray(reverseList(list)));  // [5, 4, 3, 2, 1]
`,

    'DSA/Trees/level_order_traversal.js': `/**
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
`,

    'DSA/DynamicProgramming/climbing_stairs.js': `/**
 * Climbing Stairs
 * Difficulty: Easy
 * 
 * You are climbing a staircase. It takes n steps to reach the top.
 * Each time you can either climb 1 or 2 steps.
 * How many distinct ways can you climb to the top?
 * 
 * Example:
 *   Input: n = 3
 *   Output: 3 (1+1+1, 1+2, 2+1)
 */

function climbStairs(n) {
  if (n <= 2) return n;

  let prev1 = 2;
  let prev2 = 1;

  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}

// Test
console.log(climbStairs(2));   // 2
console.log(climbStairs(3));   // 3
console.log(climbStairs(5));   // 8
console.log(climbStairs(10));  // 89
`,

    'DSA/Graphs/number_of_islands.js': `/**
 * Number of Islands
 * Difficulty: Medium
 * 
 * Given an m x n 2D grid map of '1's (land) and '0's (water),
 * return the number of islands.
 * 
 * Example:
 *   Input: grid = [
 *     ["1","1","0","0","0"],
 *     ["1","1","0","0","0"],
 *     ["0","0","1","0","0"],
 *     ["0","0","0","1","1"]
 *   ]
 *   Output: 3
 */

function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') return;
    grid[r][c] = '0'; // mark visited
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }

  return count;
}

// Test
const grid = [
  ['1','1','0','0','0'],
  ['1','1','0','0','0'],
  ['0','0','1','0','0'],
  ['0','0','0','1','1']
];
console.log(numIslands(grid));  // 3
`,

    'Playground/scratch.js': `// 🚀 DSA Playground - Scratch Pad
// Use this file for quick experiments and testing

// Write your code here...
console.log("Hello, DSA Playground! 🎯");

// Example: Quick sort implementation
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log(quickSort([64, 34, 25, 12, 22, 11, 90]));
`,
  };

  for (const [filePath, content] of Object.entries(files)) {
    const absPath = path.join(WORKSPACE_ROOT, filePath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content, 'utf-8');
  }

  console.log('  ✅ Workspace seeded with', Object.keys(files).length, 'files');
}
