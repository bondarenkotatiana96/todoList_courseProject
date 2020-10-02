//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://036625_xxx:036625_xxx@cluster0.uedga.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = { name: String };
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "To buy food"});
const item2 = new Item({name: "To cook food"});
const item3 = new Item({name: "To eat food"});

const defaultItems = [item1, item2, item3];

const listSchema = {name: String,
items: [itemsSchema]};
const List = mongoose.model("list", listSchema);



app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if (err) {
      console.log(err);
      } else {
        console.log("Success!");
      }
    });
    res.redirect("/");
  } else {
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}
});
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({name: customListName, items: defaultItems});
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      };
    };
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };

});

app.post("/delete", function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(req.body.checkbox, function(err){
    if(!err){
      console.log("success!!");
      res.redirect("/");
    };
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
};
});



app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started");
});
