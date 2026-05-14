const obj = {
  name: "Soheb",
  age: 22
}
const map = new Map(Object.entries(obj));

console.log(map);

for(let [key,val] of map){
  console.log(key,val)
}