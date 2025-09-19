const cloudinary = require("cloudinary").v2;
const fs = require('fs');


exports.uploadOnCloudinary =async (file) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY,
    });


    try {
      const result = await cloudinary.uploader
      .upload(file)
        console.log(result);
    fs.unlinkSync(file) 
    }
    catch (err) {
         fs.unlinkSync(file); 
        console.log(err)
    }

}