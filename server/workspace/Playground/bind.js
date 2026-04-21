function greet(){
  console.log("Hello",this.name)
}

let fn = greet.bind({name:"Alice"});

fn();

