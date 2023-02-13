//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://ohad331:admin@cluster0.q8arxuu.mongodb.net/todolistDB");
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Defult item updated");
          res.redirect("/");
        }
      });
    } else {
      if (err) {
        console.log(err);
      } else {

        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
    }
  });


});

app.get("/:listName", function(req, res) {
      const newListName =_.capitalize(req.params.listName) ;


      List.findOne({  name: newListName}, function(err, foundList) {
          if (err) {
            console.log(err);
          } else {

            console.log("no errors");

            if (foundList == null) {
              //if list doesn't exist:
              const newList = new List({
                name: newListName,
                items: defultItems
              });
              newList.save();
              res.redirect("/"+newListName);
            }
            else if (foundList.name == newListName) {
              res.render("list", {
                listTitle: foundList.name,
                newListItems: foundList.items
              });
            }
          }
          });

      });

    app.post("/", function(req, res) {

      const itemName = req.body.newItem;
      const listName = req.body.list;
      const newItem = new Item({
        name: itemName
      })
      if(listName=="Today"){
        newItem.save()
        res.redirect("/");
      }else{
        List.findOne({name:listName},function(err,foundList){
          if(!err){
            foundList.items.push(newItem);
            console.log("****the problem is here");
            foundList.save();
            console.log("succsesfully added "+itemName+"to "+foundList.name);
            res.redirect("/"+listName);
          }
          else{
            console.log(err);
          }
        });
      }


    });

    app.post("/delete", function(req, res) {
      const delItem_id = req.body.checkbox;
      const listName = req.body.listName;
      if(listName==="Today"){
        //deleting from the defult list
        Item.findByIdAndRemove(delItem_id, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log(delItem_id, "was deleted");
          }
        });
        res.redirect("/");
      }else{
        List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:delItem_id}}}, function(err,foundItem){
          if(!err){
            console.log(delItem_id,"Was deleted from",foundItem);
            res.redirect("/"+listName);
          }
          else{
            console.log(err,"*****");
          }
        })
      }


    })


    app.get("/about", function(req, res) {
      res.render("about");
    });

    app.listen(process.env.PORT || 3001, function() {
      console.log("Server started on port 3000");
    });
