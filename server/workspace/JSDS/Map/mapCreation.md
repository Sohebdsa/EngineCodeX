# JavaScript `Map` — Complete Guide

A `Map` in JavaScript is a collection of **key-value pairs** where:

* Keys can be **any datatype** (string, number, object, function, etc.)
* Order of insertion is maintained
* No duplicate keys allowed

---

# Creating a New Map

```js
const map = new Map();
```

Example:

```js
const userMap = new Map();

userMap.set("name", "Soheb");
userMap.set("age", 22);

console.log(userMap);
```

Output:

```js
Map(2) {
  'name' => 'Soheb',
  'age' => 22
}
```

---

# Creating Map with Initial Values

```js
const map = new Map([
  ["name", "Soheb"],
  ["age", 22],
  ["city", "Nashik"]
]);

console.log(map);
```

---

# Important Map Functions

---

# 1. `set()` → Add Values

Adds key-value pairs.

Syntax:

```js
map.set(key, value)
```

Example:

```js
const map = new Map();

map.set("name", "Soheb");
map.set("age", 22);

console.log(map);
```

Output:

```js
Map(2) { 'name' => 'Soheb', 'age' => 22 }
```

---

# 2. `get()` → Access Value

Gets value using key.

Syntax:

```js
map.get(key)
```

Example:

```js
const map = new Map();

map.set("language", "JavaScript");

console.log(map.get("language"));
```

Output:

```js
JavaScript
```

---

# 3. `has()` → Check Key Exists

Returns `true` or `false`.

Syntax:

```js
map.has(key)
```

Example:

```js
const map = new Map();

map.set("role", "Developer");

console.log(map.has("role"));
console.log(map.has("salary"));
```

Output:

```js
true
false
```

---

# 4. `delete()` → Remove Item

Deletes a key.

Syntax:

```js
map.delete(key)
```

Example:

```js
const map = new Map();

map.set("name", "Soheb");

map.delete("name");

console.log(map);
```

Output:

```js
Map(0) {}
```

---

# 5. `clear()` → Remove Everything

Deletes all items.

Syntax:

```js
map.clear()
```

Example:

```js
const map = new Map();

map.set("a", 1);
map.set("b", 2);

map.clear();

console.log(map);
```

Output:

```js
Map(0) {}
```

---

# 6. `size` → Total Elements

Returns total number of entries.

Example:

```js
const map = new Map();

map.set("a", 1);
map.set("b", 2);

console.log(map.size);
```

Output:

```js
2
```

---

# 7. `keys()` → Get All Keys

Example:

```js
const map = new Map([
  ["name", "Soheb"],
  ["age", 22]
]);

for (let key of map.keys()) {
  console.log(key);
}
```

Output:

```js
name
age
```

---

# 8. `values()` → Get All Values

Example:

```js
const map = new Map([
  ["name", "Soheb"],
  ["age", 22]
]);

for (let value of map.values()) {
  console.log(value);
}
```

Output:

```js
Soheb
22
```

---

# 9. `entries()` → Get Key + Value

Example:

```js
const map = new Map([
  ["name", "Soheb"],
  ["age", 22]
]);

for (let [key, value] of map.entries()) {
  console.log(key, value);
}
```

Output:

```js
name Soheb
age 22
```

---

# 10. `forEach()` → Iterate Map

Example:

```js
const map = new Map([
  ["html", 90],
  ["css", 80],
  ["js", 95]
]);

map.forEach((value, key) => {
  console.log(key, value);
});
```

Output:

```js
html 90
css 80
js 95
```

---

# Using Object as Key (Power of Map 😎)

```js
const map = new Map();

const obj = { id: 1 };

map.set(obj, "User Data");

console.log(map.get(obj));
```

Output:

```js
User Data
```

---

# Difference Between `Map` and Object

| Feature          | Map                            | Object                    |
| ---------------- | ------------------------------ | ------------------------- |
| Key Types        | Any datatype                   | Only string/symbol        |
| Order Maintained | Yes                            | Mostly                    |
| Iteration        | Easy                           | Extra methods needed      |
| Performance      | Better for frequent add/remove | Good for simple data      |
| Size             | `map.size`                     | `Object.keys(obj).length` |

---

# Real Interview Example — Frequency Counter

Very common DSA/interview usage.

```js
const arr = [1,1,2,2,3,4,4];

const map = new Map();

for(let num of arr){
  map.set(num, (map.get(num) || 0) + 1);
}

console.log(map);
```

Output:

```js
Map(4) {
  1 => 2,
  2 => 2,
  3 => 1,
  4 => 2
}
```

---

# Important Interview Notes

## Map stores unique keys

```js
const map = new Map();

map.set("a", 1);
map.set("a", 100);

console.log(map);
```

Output:

```js
Map(1) { 'a' => 100 }
```

Old value gets overwritten.

---

# Convert Object → Map

```js
const obj = {
  name: "Soheb",
  age: 22
};

const map = new Map(Object.entries(obj));

console.log(map);
```

---

# Convert Map → Object

```js
const map = new Map([
  ["name", "Soheb"],
  ["age", 22]
]);

const obj = Object.fromEntries(map);

console.log(obj);
```

---

# Most Common Uses of Map

* Frequency counting
* Caching
* Storing unique data
* Graphs in DSA
* Fast lookups
* LRU Cache
* Tracking visited nodes

---

# Small Practice Questions

1. Count frequency of characters in string
2. Find first non-repeating character
3. Group anagrams
4. Two Sum problem
5. Find duplicates in array
6. Create phonebook using Map

Map is basically the “Swiss Army knife” of JavaScript interviews 🔥
