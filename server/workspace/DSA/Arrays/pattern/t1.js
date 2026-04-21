let row = ''
let n = 5;
let row2 = ''
for (let i = n; i >= 0; i--) {
  for (let j = 0; j < i; j++) {
    row += ' '
  }
  for (let j = 0; j < 5; j++) [
    row += "*"
  ]
  console.log(row)
  row = ''
  row2 = ''
}
