// Count Even Numbers
let arr=[1,2,3,4,5,6,7,8,9,10];
let even=[]
for(let i=0;i<arr.length;i++){
  if(arr[i]%2==0){
    even.push(arr[i]);
  }
}
console.log("Even number: ")
console.log(even);
// count odd number 
let odd=[]
for (let i = 0; i < arr.length; i++) {
  if (arr[i] % 2 != 0 ) {
    odd.push(arr[i]);
  }
}
console.log("Odd number: ")
console.log(odd);