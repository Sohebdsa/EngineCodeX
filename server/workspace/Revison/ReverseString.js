// 4. Reverse a String
let s="soheb"
let l=0;
let r=s.length-1;

let arr=s.split("")
// console.log(arr)

while (l < r) {
  let temp = arr[r];
  arr[r] = arr[l]
  arr[l] = temp;
  l++;
  r--;
}
s=''
arr.forEach(x=>{
  s+=x;
})

console.log(s)