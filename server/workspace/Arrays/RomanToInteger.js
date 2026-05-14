var romanToInt = function (s) {
    let roman = new Map([
        ["I", 1],
        ["V", 5],
        ["X", 10],
        ["L", 50],
        ["C", 100],
        ["D", 500],
        ["M", 1000]
    ])
    let res = 0;
    for (let i = 0; i < s.length; i++) {
        if (roman.get(s[i]) < roman.get(s[i + 1])) {
            res -= roman.get(s[i]);  
        } else {
            res += roman.get(s[i]);   
        }
    }
    return res;
};

console.log(romanToInt("MMXXVI"));