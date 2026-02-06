import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorHandler from './middlewares/errorHandler.middleware.js'


const app=express()
app.use(cors({
    origin:["http://localhost:5173","https://chit-chat-talkify.vercel.app"],
    credentials: true, 
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

import userRouter from './routes/user.route.js'
app.use('/api/v1/user',userRouter)


import friendRouter from './routes/friend.route.js'
app.use('/api/v1/friend',friendRouter)

import messageRouter from './routes/message.routes.js'
app.use('/api/v1/message',messageRouter)







app.use(errorHandler)
export default app