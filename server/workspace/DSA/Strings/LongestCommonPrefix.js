var longestCommonPrefix = function(strs) {
    if (strs.length == 0) return ""
    if (strs.length == 1) return strs[0];
    let res=strs[0];
    for(let i=1;i<strs.length;i++){
        if(strs[i].length < res.length){
            res=strs[i];
        }
    }
    strs.forEach(x=>{
        for(let i=0;i<Math.min(x.length,res.length);i++){
            if(res[i]!==x[i] ){
                res=res.substring(0,i);
                break;
            }

        }
    })
    return res.length > 0 ? res:"";
};
console.log(longestCommonPrefix(['flower','flight','flow']))