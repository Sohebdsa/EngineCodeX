var isPalindrome = function(x) {
    if (x < 0) return false;
    let num=x.toString();
    let l=0;
    let r=num.length-1;

    while(l<r){
        if(num[l]!=num[r]){
            return false;
        }
        l++;
        r--;
    }
    return true;
};

console.log(isPalindrome(131));