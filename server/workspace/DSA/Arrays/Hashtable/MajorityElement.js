/**
 * @param {number[]} nums
 * @return {number}
 */
/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  let maj = nums[0];
  let map = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (map.has(nums[i])) {
      map.set(nums[i], map.get(nums[i]) + 1)
    }
    else{
      map.set(nums[i], 1);
    }
  }

  for (let [key, val] of map) {
    console.log(key,": ",val )
    if (val > map.get(maj)) {
      maj = key;
    }
  }
  return maj;
};
console.log(majorityElement([6,5,5]));