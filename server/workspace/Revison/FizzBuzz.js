// 1 to 20:
// multiples of 3 → "Fizz"
// multiples of 5 → "Buzz"
// both → "FizzBuzz"

let num=20;
for(let i=1;i<num;i++){
  if((i%3)==0 && (i%5)==0){
    console.log("FizzBuzz",i);
  }
  else if(i%3==0){
    console.log("Fizz",i)
  }
  else if(i%5==0){
    console.log("Buzz",i)
  }
}