var isHappy = function(n) {
    let map = new Map();
    let res=n;
    while(!map.has(res)){
        if(res == 1){
            return true;
        }
        let x=res.toString();
        let c=0;
      for (let i = 0; i < x.length; i++) {
        let digit = Number(x[i]);
        c += digit * digit;
      }
        res=c;
        map.set(res,1);
    }
    for(let [key,val] of map){
      console.log(key,":",val);
    }
    return false;
};
console.log(isHappy(2));