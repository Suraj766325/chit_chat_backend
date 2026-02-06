import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,lowercase:true,unique:true,index:true},
    password:{type:String,required:true,select:false},
    avatar:{type:String},
    avatar_public_id:{type:String},
    refreshToken:{type:String,select:false}
},{timestamps:true})


userSchema.pre('save',async function(){
    if(!this.isModified('password')) return 
    this.password=await bcrypt.hash(this.password,10)
})

userSchema.methods.isPasswordCorrect=async function(password){
    return bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {_id:this._id,email:this.email,name:this.name},
        process.env.ACCESS_TOKEN,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {_id:this._id,email:this.email,name:this.name},
        process.env.REFRESH_TOKEN,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}
const User=mongoose.model('User',userSchema)



export default User