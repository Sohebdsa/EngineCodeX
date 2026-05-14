let n = 5;

for (let i = 0; i < n; i++) {
  let row = "";

  // spaces
  for (let j = 0; j < n - i - 1; j++) {
    row += " ";
  }

  // stars
  for (let j = 0; j < 2 * i + 1; j++) {
    row += "*";
  }

  console.log(row);
}
