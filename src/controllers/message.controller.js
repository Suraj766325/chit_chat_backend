import { uploadOnCloudinary } from "../config/cloudinary.config.js";
import Message from "../models/message.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


const getDbMessage=asyncHandler(
    async(req,res)=>{
        const {senderId,receiverId}=req.body
         if(!senderId) throw new ApiError(400,'senderId is required')
        if(!receiverId) throw new ApiError(400,'receiverId is required')
        const messages = await Message.find({$or: [{ senderId, receiverId },{ senderId: receiverId, receiverId: senderId }]}).sort({ createdAt: 1 })
        res.status(200)
            .json(new ApiResponse(200,'message Fetched',messages))
        }
)

const createDbImage=asyncHandler(
    async(req,res)=>{
        const {senderId,receiverId,senderName}=req.body
        if(!senderId) throw new ApiError(400,'senderId is required')
        if(!senderName) throw new ApiError(400,'senderName is required')
        if(!receiverId) throw new ApiError(400,'receiverId is required')
        const imageLocalPath=req.files?.image?.[0]?.path
        if(!imageLocalPath) throw new ApiError(400,'image is required')
        const result=await uploadOnCloudinary(imageLocalPath)
        if(!result) throw new ApiError(500,'internal server error')
        const message=await Message.create({
            senderId,
            senderName,
            receiverId,
            image:result.url
        })
        res.status(201)
            .json(new ApiResponse(201,'message created',{message}))
    }
)

const createServerDbMessage=async function(obj){
    try{
        const {senderId,senderName, receiverId, text}=obj
        if(!senderId) return
        if(!senderName) return
        if(!receiverId) return
        if(!text) return
        const message=await Message.create({
                senderId,
                senderName,
                receiverId,
                text
        })
    }
    catch(err){
        console.log(err)
    }
}

const ServerSeenMessage=async function (obj){
    try{
        if(!obj._id) return 
        const result= await Message.findByIdAndUpdate(obj._id,{status:'seen'},{new:true})
    }
    catch(err){
        console.log(err)
    }
}


export {
    getDbMessage,
    createDbImage,
    createServerDbMessage,
    ServerSeenMessage
}