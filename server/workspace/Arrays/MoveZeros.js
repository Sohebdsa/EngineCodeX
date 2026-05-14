// Input: [0,1,0,3,12]
// Output: [1,3,12,0,0]

// let num =[0,1,0,3,12]
// for(let i=0;i<num.length;i++){
//   let j=i+1;
//   if(num[i]==0){
//     while(j==0 && j<num.length){
//       j++;
//     }
//     let temp=num[i];
//     num[i]=num[j];
//     num[j]=temp;
//   }
// }
// console.log(num)

function moveZeroes(nums) {
  let i = 0; // slow pointer

  for (let j = 0; j < nums.length; j++) { // fast pointer
    if (nums[j] !== 0) {
      // swap non-zero forward
      [nums[i], nums[j]] = [nums[j], nums[i]];
      i++;
    }
  }
  return nums;
}

let num = [0, 1, 0, 3, 12];
console.log(moveZeroes(num)); // [1,3,12,0,0]
