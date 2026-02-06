import { uploadOnCloudinary } from "../config/cloudinary.config.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken=async(_id)=>{
    const user=await User.findById(_id)
    if(!user) throw new ApiError(500,'Internal server error')
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save()
    return {accessToken,refreshToken}

}


const registerUser =asyncHandler(
    async(req,res)=>{
        const {name,email,password}=req.body
        if(!name?.trim()) throw new ApiError(400,'name is required')
        if(!email?.trim()) throw new ApiError(400,'email is required')
        if(!password?.trim()) throw new ApiError(400,'password is required')
        const userExist=await User.findOne({email})
        if(userExist) throw new ApiError(400,'email already exist')
        const avatarLocalPath=req.files?.avatar?.[0]?.path
        const avatarResult=await uploadOnCloudinary(avatarLocalPath)
        const user= await User.create({
            name,
            email,
            password,
            avatar:avatarResult?.url,
            avatar_public_id:avatarResult?.public_id
        })
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
        const options={
            httpOnly:true,
            secure:true,
            sameSite:"none"
        }
        res.status(201)
            .cookie('refreshToken',refreshToken,options)
            .json(new ApiResponse(201,"user registered",{_id:user._id,name:user.name,email:user.email,avatar:user.avatar,accessToken}))
        
    }
)

const loginUser=asyncHandler(
    async(req,res)=>{
        const {email,password}=req.body
        if(!email?.trim()) throw new ApiError(400,'email is required')
        if(!password?.trim()) throw new ApiError(400,'password is required')
        const user=await User.findOne({email}).select('+password')
        if(!user) throw new ApiError(404,'user not found')
        const validatePassword=await user.isPasswordCorrect(password)
        if(!validatePassword) throw new ApiError(401,'invalid credentials')
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
        const options={
            httpOnly:true,
            secure:true,
            sameSite:"none"
        }
        res.status(200)
            .cookie('refreshToken',refreshToken,options)
            .json(new ApiResponse(200,'user logged in',{_id:user._id,name:user.name,email:user.email,avatar:user.avatar,accessToken}))
    }
)


const logoutUser=asyncHandler(
    async(req,res)=>{
        console.log('logoutUser call hua')
        const options={
            httpOnly:true,
            secure:true,
            sameSite:'none'
        }
        res.status(200)
            .clearCookie('refreshToken', options)
            .json(new ApiResponse(200,'user logged out'))
    }
)

const refreshUser=asyncHandler(
    async(req,res)=>{
        const token=req.cookies?.refreshToken
        if(!token) throw new ApiError(401,'unauthorized access')
        let decodedToken
        try{
            decodedToken=jwt.verify(token,process.env.REFRESH_TOKEN)
        }
        catch(err){
            throw new ApiError(401,'unauthorized access')
        }
        const user=await User.findById(decodedToken._id)
        if(!user) throw new ApiError(401,'unauthorized access')        
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
        const options={
            httpOnly:true,
            secure:true,
            sameSite:"none"
        }
        res.status(200)
            .cookie('refreshToken',refreshToken,options)
            .json(new ApiResponse(200,'Token refreshed',{_id:user._id,name:user.name,email:user.email,avatar:user.avatar,accessToken}))   
        }
)

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshUser,
}