// Input: [1,1,2,2,3,4,4]
// Output: [1,2,3,4]

let nums = [1,1,2,2,3,4,4]
// let i=0;

// for(let j=1;j<num.length;j++){
//   if(num[j]!==num[i]){
//     i++;
//     num[i]=num[j];
//   }
// }

function removeDuplicates(nums) {
    let i=0;
    for(let j=1;j<nums.length;j++){
        if(nums[j]!=nums[i]){
            i++;
            nums[i]=nums[j];
        }
    }
    return nums;
};
console.log(removeDuplicates(nums))