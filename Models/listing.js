const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: "https://cdn11.bigcommerce.com/s-x49po/images/stencil/1500x1500/products/120940/246493/1684308575176_IMG-20230430-WA0040__1___31721.1686995781.jpg?c=2",
        set: (v) => v === "" ? "https://cdn11.bigcommerce.com/s-x49po/images/stencil/1500x1500/products/120940/246493/1684308575176_IMG-20230430-WA0040__1___31721.1686995781.jpg?c=2" : v,
    },
    price: Number,
    location: String,
    country: String
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;