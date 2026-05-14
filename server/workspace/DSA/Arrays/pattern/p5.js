let row=''
let n=5;
for(let i=n;i>=0;i--){
  let count=1;
  for(let j=0;j<i;j++){
    row+=''+count++
  }
  console.log(row)
  row=''
}