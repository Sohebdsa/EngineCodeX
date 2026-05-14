// Input: [2,7,11,15], target = 9
// Output: [0,1]

let num=[2,7,11,15];
let target=9;


function twosum(num,t){
  let map= new Map();
  for(let i=0;i<num.length;i++){
    let x = t - num[i];
    if(map.has(x)){
      return [map.get(x),i]
    }
    map.set(num[i],i);
  }
  return -1
}

console.log(twosum(num,target))