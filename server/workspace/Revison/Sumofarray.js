let num=[1,2,3,4,5,6,7,8,9];
let res=0;
num.forEach(x=>{
  res+=x;
})
console.log(res)

let x=num.reduce((acc,x)=>
  x+acc,0
)
console.log(x)