let s="racecar";

function palindrome(a){
  let l=0;
  let r=a.length-1;
  while(l<r){
    if(a[r]!=a[l]){
      return false;
    }
    l++;
    r--;
  }
  return true;
}

console.log(palindrome(s)?"palindrome":"Not palindrome");