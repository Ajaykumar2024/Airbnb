const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req,res)=>{
   const allListings=await Listing.find({}); 
   res.render("./listings/index.ejs",{allListings});
};


module.exports.renderNewForm =(req,res)=>{
    console.log(req.user );
    res.render("listings/new.ejs");
};

module.exports.showListing =async (req,res)=>{
    let {id} = req.params;
     const listing = await Listing.findById(id)
    .populate({
        path: "reviews" ,
        populate :{
            path: "author" ,
        },
    })
    .populate("owner");
        if(!listing){
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}



module.exports.createListing = async (req,res,next)=>{
    try{
        
        const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
            q: req.body.listing.location, // user-entered address
            format: "json",
            limit: 1
        },
        headers: {
            'User-Agent': 'YourAppName (your@email.com)'
        }
        });
        
        if (!geoRes.data.length) {
            req.flash("error", "Invalid location. Please enter a valid address.");
            return res.redirect("/listings/new");
        }
        const { lat, lon } = geoRes.data[0];
        
        let url =req.file.path;
        let filename= req.file.filename;

        const newListing= new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image= {url,filename};
        newListing.geometry = {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)] // [lng, lat]
            };
        await newListing.save();
        req.flash("success", "New Listing Created !");
        res.redirect("/listings");
    }catch(err){
        req.flash("error", "Something went wrong while creating the listing.");
        res.redirect("/listings/new");
    }
}



module.exports.renderEditForm =async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
         req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl= listing.image.url;
    console.log("Original image URL:", listing.image.url);

     originalImageUrl= originalImageUrl.replace("/upload", "/upload/w_200");
    res.render("listings/edit.ejs",{listing, originalImageUrl});

}

module.exports.updateListing = async (req,res)=>{
    
    let {id} = req.params;
    let listing=await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url =req.file.path;
        let filename= req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success", " Listing Updated !");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", " Listing Deleted !");
     res.redirect("/listings");
}

