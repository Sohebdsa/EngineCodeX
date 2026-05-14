function outer(){
  return function(){
    console.log("Hello")
  }
}
const fn = outer();

fn();
fn();
fn();