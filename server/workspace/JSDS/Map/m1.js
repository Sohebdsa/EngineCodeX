// 1. Store Student Data

// Create a Map to store:

// name
// age
// course

// Then print all values.

const map = new Map(
  [
    ["name","soheb"],
    ["age",20],
    ["sub","iot"]
  ]
)

for (let val of map.values()){
  console.log(val)
}

// Example Output: 
// soheb
// 20
// Iot