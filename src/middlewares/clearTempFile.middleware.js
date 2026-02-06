import fs from 'fs'

const clearTempFile=(req,res,next)=>{
    res.on('finish',()=>{
        try{
            if(req.files?.avatar?.[0]?.path) fs.unlinkSync(req.files.avatar[0].path)
            if(req.files?.image?.[0]?.path) fs.unlinkSync(req.files.image[0].path)
        }
        catch(err){
            console.log(err)
        }
    })
    next()
}

export default clearTempFile

