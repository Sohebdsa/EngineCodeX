// Write a function and use .call() to print a different user’s name
function name(name) {
  console.log("Hello", this.name)
}

const user1 = { name: "alice" };
const user2 = { name: "Ayan" }

name.call(user1)
name.call(user2)