let row=''
let n=5;
for(let i=n;i>=0;i--){
  for(let j=0;j<i;j++){
    row+='*'
  }
  console.log(row)
  row=''
}