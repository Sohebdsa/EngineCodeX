/**
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
