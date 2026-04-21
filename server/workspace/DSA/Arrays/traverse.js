const arr = [1,2,3,4,5,6,7,8,9];
let i=0;

//using for loop
for(let i=0;i<arr.length;i++){
  console.log(arr[i]);
}
// using do while
do{
  console.log(arr[i]);
  i++;
}while(i<arr.length)

// using map function
arr.map((x)=>{
  console.log(x)
  i++;
})
