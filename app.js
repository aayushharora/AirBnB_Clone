const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./Models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");


const mongo_url = "mongodb://127.0.0.1:27017/wanderlust"

main().then(()=>{
    console.log("Connected to the DB");
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(mongo_url);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

app.get("/", (req, res)=>{
    console.log("Hi, I am Root!");
    res.send("I'm Root!")
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
}

// Show Route
app.get("/listings", wrapAsync(async (req, res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing})
}));

// New Route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs")
})

// View Route
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing})
}));

// Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
})
);

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing!")
    }
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing!")
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings")
}));

// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calungate, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("Sample was saved!");
//     res.send("Succesful testing!")
// })

app.all("*", (req, res, next) =>{
    next(new ExpressError(404, "Page not Found!"))
})

app.use((err, req, res, next)=>{
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(404).render("error.ejs", {message})
    // res.status(statusCode).send(message);
})

app.listen(8080, ()=>{
    console.log("Listening to Port: 8080");
});