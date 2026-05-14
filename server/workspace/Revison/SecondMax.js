// Input: [10, 5, 8, 20]
// Output: 10

let num =[10,20,30,40,50,60,70,80,90];
let max=num[0];
let sec=0;
for(let i=1;i<num.length;i++){
  if(num[i] > max){
    sec=max
    max=num[i];
  }
}
console.log(sec);
