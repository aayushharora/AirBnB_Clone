const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js")

app.set("view engine", "ejs");
app.set("views", path.join((__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const validateListing = (req,res,next)=>{
  let {error} = listingSchema.validate(req.body)
    if (error){
      throw new ExpressError(400,error)
    }else{
      next()
    }
}

app.get("/", (req, res) => {
  res.redirect("/listings");
});

//^ {INDEX ROUTE (All Listings)}
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//^{CREATE ROUTE (New Listing)} : (2 Routes)
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    // let {title,description,image,price,location,country} = req.body
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing!");
    // }

    // let result = listingSchema.validate(req.body)
    // // console.log(result.error)
    // if (result.error){
    //   throw new ExpressError(400,result.error)
    // }

    let newListing = new Listing(req.body.listing);

    // if(!newListing.description.length){
    //   throw new ExpressError(400, "Description is missing!")
    // }
    // if(!newListing.location){
    //   throw new ExpressError(400, "Location is missing!")
    // }
    // if(!newListing.country){
    //   throw new ExpressError(400, "Country is missing!")
    // }

    await newListing.save();
    res.redirect("/listings");

    // try {
    //   // let {title,description,image,price,location,country} = req.body
    //   let newListing = new Listing(req.body.listing);
    //   await newListing.save();
    //   res.redirect("/listings");
    // } catch (error) {
    //   next(error)
    // }
  })
);

//^ {SHOW ROUTE (Data about a specific listing)}
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  })
);

//^ {EDIT & UPDATE ROUTE(s)} (2 Routes)
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing!");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

//^ {DELETE ROUTE}
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Some Error Occurred!" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{err})
});

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the Beach",
//     price: 1200,
//     location: "South Goa",
//     country: "India",
//   });

//   await sampleListing.save()
//   console.log("Sample was Saved!")
//   res.send("successful testing!")
// });

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
