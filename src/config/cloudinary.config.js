import {v2 as cloudinary} from 'cloudinary'
const cloudinaryConnect=()=>{
    cloudinary.config({
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET
    })
    console.log("cloudinary connect")
}

const uploadOnCloudinary=async(localPath)=>{
    try{
        if(!localPath) return null
        return await cloudinary.uploader.upload(localPath,{resource_type:"auto"})
    }
    catch(err){
        throw err
    }  
}






const deleteFromCloudinary=async(public_id)=>{
    try{
        if(!public_id) return null
        return await cloudinary.uploader.destroy(public_id)
    }
    catch(err){
        throw err
    }
}


export default cloudinaryConnect
export{
    uploadOnCloudinary,
    deleteFromCloudinary,
}