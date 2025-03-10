import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    }); 
    


    // const uploadResult = await cloudinary.uploader
    // .upload(
    //     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //         public_id: 'shoes',
    //     }
    // )
    // .catch((error) => {
    //     console.log(error);
    // });



    // Upload an image
    const uploadonCloudnary = async (path) => {
        try {
            if(!path) return null;
            const response = await cloudinary.uploader.upload(path, {
                resource_type: "auto"
            })
            console.log("Image uploaded successfully on cloudnary", response.url);
            return response;
            
        } catch (error) {
            fs.unlinkSync(localfilepath) // remove the file
            console.log("Error uploading image on cloudnary", error);
            return null;
        }

    }
}
)


    // console.log(uploadResult);
    
    // // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    
    // console.log(optimizeUrl);
    
    // // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    // }    
    // console.log(autoCropUrl);    
// })();