const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

// path is use to require ejs template 
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync  = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const { error } = require("console");
const {listingSchema}= require("./schema.js");

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
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.send("Hi,i am root ");

});

 const validateListing=(req,res,next)=>{
    let {error} =listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }

 }

// index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}); // Fetches all documents from the listing collection.
    res.render("listings/index.ejs", { allListings });

}));


//  new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});



//  show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

// create route
app.post("/listings", validateListing,wrapAsync(async (req, res, next) => {
    // let(title.description,image,price,country,location)=req.body;// this method is long to extract data so be use shortcut method by making the  html data object

    //  used for  custom error  handler 
// if(!req.body.listing){
//     throw new ExpressError(400," send valid  data  for listing ");
// }

//  the listingSchema which is defined inside the  joi checks that the condition define in the joi   is satisfied by yht req.body or not 

let result=listingSchema.validate(req.body);
console.log(result);

if(result.error){
    throw new ExpressError(400, result.error);
}
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

})
);


//  edit route
app.get("/listings/:id/edit",wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// update route
app.put("/listings/:id",validateListing,wrapAsync( async (req, res) => {
    if(!req.body.listing){
        throw new ExpressError(400," send valid  data  for listing ");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//  delete route
app.delete("/listings/:id",wrapAsync( async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
})); 


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

//  this message is send to all routes in case of found wrong route  
app.all("*",(req,res,next)=>{
    next( new ExpressError(404,"page not found"));

});

// error handler to show one line error when data  is enter from integer to string  in form (express error  file use from  utils)

app.use((err, req, res, next) => {
   let{statusCode=500,message="something went wrong "}=err;
  res.status (statusCode).render("error.ejs",{message});

//    res.status(statusCode).send(message);

});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});