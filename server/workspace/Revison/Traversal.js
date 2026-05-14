// Traverse an Array and reverse Traverse

let arr=[1,2,3,4,5,6,7,8]
let t=''
for(let i=0;i<arr.length;i++){
  t+=arr[i];
}
console.log(t)
let r=''
for(let i=arr.length-1;i>=0;i--){
  r+=arr[i];
}
console.log(r)
