import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async function (localfilepath){
  try {
    if(!localfilepath) return null
    const response = await cloudinary.uploader.upload(localfilepath,{
      resource_type : 'auto'
    })
    // console.log("file is uploaded","\n response.url is this:",response.url);
    fs.unlinkSync(localfilepath)
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath)
    return null
  }
}

export {uploadOnCloudinary}