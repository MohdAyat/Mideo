function printMe(obj){
  obj.name = "barkat"
  console.log(obj);
  console.log("here");
}
function test(){
  const abc = {
    name : "ayat",
    class: "2nd"
  }
  printMe(abc)
  console.log("after :",abc)
}
test()
// printMe({
//   name: "ayat",
//   class: "1st"
// })