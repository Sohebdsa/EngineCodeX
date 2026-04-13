/**
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
