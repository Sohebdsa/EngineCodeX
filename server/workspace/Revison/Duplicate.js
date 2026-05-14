// find duplicate
// 1.Solution 1 T O(n^2) S-O(1)
let num = [1,2,3,3,4,5]

// function find_duplicate(){
//   for (let i = 0; i < num.length; i++) {
//     for (let j = i+1; j < num.length - 1; j++) {
//       if (num[i] == num[j] && i != j) {
//         return [i,j]
//       }
//     }
//   }
// }
// console.log(find_duplicate(num));

// solution 2 T-0(2N) S-0(1)

// let arr=num.sort((a, b) => a - b);
// for(let i=0;i<arr.length-1;i++){
//   if(arr[i]==arr[i+1]){
//     console.log(i,i+1)
//   }
// }

//solution 3 flyod cycle special constraint T-O(N) S-O(1)

// function findDuplicate(nums) {
//   let slow = nums[0];
//   let fast = nums[0];

//   // detect cycle
//   do {
//     slow = nums[slow];
//     fast = nums[nums[fast]];
//   } while (slow !== fast);

//   // find entry point
//   slow = nums[0];
//   while (slow !== fast) {
//     slow = nums[slow];
//     fast = nums[fast];
//   }

//   return [num[slow],num[fast]];
// }
// console.log(findDuplicate(num))

//Solution 4 optimal solution T-O(N) S-O(N)

// let set= new Set();

// for(let i=0;i<num.length;i++){
//   if(set.has(num[i])){
//     console.log("duplicate element is ",num[i]," at ",i);
//   }
//   set.add(num[i])
// }

