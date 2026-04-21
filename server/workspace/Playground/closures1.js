const user = {
  name:"soheb",
  show:function(){
    const inner = ()=>{
      console.log("Hello",this.name);
    }
    inner();
  }
}
user.show();