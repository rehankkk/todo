//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const { redirect, type } = require("express/lib/response");
const { Schema } = mongoose;
const lodash = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//database connection 
mongoose.connect('mongodb+srv://rehan:rehan@cluster0.bm5q6.mongodb.net/TodoDatabase?retryWrites=true&w=majority');

//create schema
const itemSchema=new Schema({
  name:String
});

//create model
const Item=mongoose.model("Item",itemSchema)


const item1=new Item({
    name: "welcome to yout todolist"
});

const item2=new Item({
  name: "Hit the + button to aff a new item"
});
const item3=new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

// custume list shecma
const listSchema=new Schema({
  name:String,
  items:[itemSchema]
});

//create model
const List=mongoose.model("List",listSchema)

app.get("/", function(req, res) {

   Item.find({},(err,data)=>{
      if(data.length==0)
      {
        Item.insertMany(defaultItems,(err)=>{
          if(err)
          {
            console.log("error occor")
          }
          });
          res.redirect("/");
      }
      else{
        res.render("list", {listTitle:"Today", newListItems: data});
      }
     
   })

 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  //add new data in database
  const item=new Item({
    name:itemName
  })
  if(listName=="Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName} ,(err,FoundList)=>{
         FoundList.items.push(item);
         FoundList.save();
         res.redirect("/"+listName)
    }); 
  }
});

app.get("/:customListName",(req,res)=>{
  const customListName=lodash.capitalize(req.params.customListName);
  
  List.findOne({name:customListName},(err,foundlist)=>{
    if(!foundlist)
    {
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName)
     
    }
    else{
      res.render("list", {listTitle:foundlist.name , newListItems: foundlist.items});
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", function(req, res){
  const listItem=req.body.listitem
  const customlistTitle=req.body.listName
  console.log(typeof customlistTitle)
  if(customlistTitle == "Today")
  {
    Item.findByIdAndRemove(listItem,(err)=>{
      if(err)
      {
        console.log("err"+err)
      }
      else{
        res.redirect("/")
      }
    })
  }
  else
  {
    List.findOneAndUpdate({name:customlistTitle},{$pull:{items: {_id: listItem}}},(err,foundList)=>{
      if(!err){
        res.redirect("/"+customlistTitle)
      }
    })

  }
 
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
