// Write a function sumAll using reduce() that returns sum of array

function sumAll(x){
  let y = x.reduce((acc,x)=>x+acc,0)
  return y;
}

console.log(sumAll([1,2,3]));