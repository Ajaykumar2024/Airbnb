const { types } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review.js");

// Define schema
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename:String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    geometry: {
        type: {
        type: String,
        enum: ['Point'], // Only 'Point' type allowed
        required: true
        },
        coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
        }
    }
});

 listingSchema.index({ geometry: '2dsphere' }); // For geospatial queries


listingSchema.post("findOneAndDelete", async(listing) =>{
    if(listing){
       await Review.deleteMany({ _id : {$in: listing.reviews}});
    }
});


// Compile model correctly
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
