import mongoose from 'mongoose'

async function dbConnet(){
    try{
        const result=await mongoose.connect(process.env.MONGO_DB)
        return result
    }
    catch(err){
        throw err
    }
}

export default dbConnet