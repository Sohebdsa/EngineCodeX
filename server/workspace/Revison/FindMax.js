let num =[100,20,30,40,50,60,70,80,90];
let max=num[0];

for(let i=1;i<num.length;i++){
  if(num[i] > max){
    max=num[i];
  }
}
console.log(max);
