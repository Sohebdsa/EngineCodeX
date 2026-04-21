let row=''
let n=5;
let count=0;
for(let i=0;i<n;i++){
  count++;
  for(let j=0;j<=i;j++){
    row+=''+count
  }
  console.log(row)
  row=''
}