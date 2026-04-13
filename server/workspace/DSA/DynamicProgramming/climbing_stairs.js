/**
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
