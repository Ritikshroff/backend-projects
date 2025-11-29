// import {v2 as cloudinary} from "cloudinary";
// import fs from "fs";

//     // Configuration
//     cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_SECRET_KEY
//     }); 



//     // Upload an image
    
//     const uploadonCloudnary = async (path) => {
//         try {
//             if(!path) return null;
//             const response = await cloudinary.uploader.upload(path, {
//                 resource_type: "auto"
//             })
//             console.log("Image uploaded successfully on cloudnary", response.url);
//             fs.unlinkSync(path) // remove the file
//             return response;
            
//         } catch (error) {
//             fs.unlinkSync(localfilepath) // remove the file
//             console.log("Error uploading image on cloudnary", error);
//             return null;
//         }

//     }

//     export default uploadonCloudnary;


import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadonCloudnary = async (path) => {
  try {
    if (!path) return null;

    const result = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
    });

    console.log("Image uploaded successfully:", result.url);

    // Safe delete
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    return result;
  } catch (error) {
    console.log("Error uploading image to Cloudinary:", error);

    // Safe delete in case of error
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    return null;
  }
};

export default uploadonCloudnary;
