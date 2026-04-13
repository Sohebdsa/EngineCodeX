/**
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
