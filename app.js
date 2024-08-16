const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

// path is use to require ejs template 
const path = require("path");
const methodOverride = require('method-override');
const ejsMate= require("ejs-mate");
// connect database to the app.js 

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then((res) => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    })
async function main() {
    await mongoose.connect(MONGO_URL);

}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
    res.send("Hi,i am root ");

});

// index route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({}); // Fetches all documents from the listing collection.
    res.render("listings/index.ejs", { allListings });
});


//  new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});



//  show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

// create route
app.post("/listings", async (req, res) => {
    // let(title.description,image,price,country,location)=req.body;// this method i long to extract data so be use shortcut method by making the  html data object

    const newListing = new Listing(req.body.listing);
   await newListing.save();
    res.redirect("/listings");
});


//  edit route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

// update route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

//  delete route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deleteListing= await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
});


// app.get("/testListing",async(req,res)=>{
//     let sampleListing= new Listing({
//         title:"my new villa",
//         description :"by thr beach",
//         price:1200,
//         location:"calangute ,Goa",
//         country:"India",
//     });


//      await sampleListing.save();
//      console.log("sample was saved");
//      res.send("sucessful testing");
// });


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});