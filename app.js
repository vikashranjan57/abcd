const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");

const WrapAsync=require("./utils/WrapAsync.js");
const ExpressError=require("./utils/expressError.js");
const {listingSchema}=require("./schema.js");
const {reviewSchema}=require("./schema.js");

const path=require("path");
const  methodOverride = require("method-override");
const ejsMate=require("ejs-mate");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust")
}

main().then((res)=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
})


// app.get("/testListing",(req,res)=>{
//     let smapleListing=new Listing({
//         title:"my new villa",
//         description:"bu the beach",
//         price:"1200",
//         location:"calangate goa",
//         coutnry:"India",
//     })

//     smapleListing.save()
//    console.log("sample was saved");
//     res.send("Successful testing");
// })


app.get("/",(req,res)=>{
    res.send("HI I am vikku");
})
 
//for server side validation for listings
//i create a method to validate the listing
//if the listing is not valid then i will throw an error
//if the listing is valid then i will call next
//this method will be called before the create route
const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}


//for server side validation for reviews
//i create a method to validate the review
//if the review is not valid then i will throw an error
//if the review is valid then i will call next
//this method will be called before the create route
const validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}



//edit route
app.get("/listings/:id/edit",WrapAsync( async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));
//update route
app.put("/listings/:id", WrapAsync( async(req,res)=>{
   
   if(!req.body.listing){
      throw new ExpressError(400,"send valid data for listing");
   }

    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.Listing});
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", WrapAsync( async(req,res)=>{
    let{id}=req.params;
    let deletedData=await Listing.findByIdAndDelete(id);
    console.log(deletedData);
    res.redirect("/listings");
}))

//new route
app.get("/listings/new",(req,res)=>{
   
    res.render("./listings/new.ejs");
})

//create route
app.post("/listings",validateListing, WrapAsync(async(req,res,next)=>{
    //let {title,description,image,price,country,location}=req.body;
   
    // if(!req.body.listing){
    //     throw new ExpressError(400,"send valid data for listing");
    //  }

const newListing=new Listing(req.body.listing);
   
    await newListing.save();

    res.redirect("/listings");
   

}
));


//index route
app.get("/listings", WrapAsync(  async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
    }));


//show route
app.get("/listings/:id", WrapAsync(  async(req,res)=>{
   let {id}=req.params;
   const listing=await Listing.findById(id).populate("reviews");  //populate is used to get the reviews of the listing
   res.render("./listings/show.ejs",{listing});
}));


//reviews route
  //post route
  app.post("/listings/:id/reviews",validateReview, WrapAsync(async(req,res)=>{
     let listing=await Listing.findById(req.params.id);
      let newReview=new Review(req.body.review);
      listing.reviews.push(newReview);
 
      await newReview.save();
      await listing.save();

      res.redirect(`/listings/${listing._id}`);
  })
);




app.all("*",(req,res,next)=>{
    next (new ExpressError(404,"page not found"));
});

app.use((err,req,res,next) =>{
    let{statusCode=500,message="something went wrong"}=err; 
    //res.status(statusCode).send(message);
    res.status(statusCode).render("./listings/error.ejs",{errMsg:message});
      
//    res.send("something went wrong");
});

app.listen(3000,()=>{
    console.log("server is listening on port 3000");
})