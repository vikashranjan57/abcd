const joi=require("joi");

const listingSchema=joi.object({
    listing:joi.object({
        title:joi.string().required(),
        description:joi.string().required(),
        location:joi.string().required(),
        country:joi.string().required(),
        image:joi.string().allow("",null),
       price:joi.string().required().min(0)

    }).required()
});

module.exports={listingSchema};


//it is schema for server side validation of review
module.exports.reviewSchema=joi.object({
      review:joi.object({
         rating:joi.number().required().min(1).max(5),
         comment:joi.string().required(),
       }).required(),
});