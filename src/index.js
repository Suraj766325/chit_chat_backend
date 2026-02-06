import http from 'http'
import {Server} from 'socket.io'
import dotenv from 'dotenv'
import app from './app.js'
import dbConnet from './config/db.config.js'
import cloudinaryConnect from './config/cloudinary.config.js'
import { createServerDbMessage, ServerSeenMessage } from './controllers/message.controller.js'
dotenv.config()



const port=process.env.PORT
const server=http.createServer(app)
const user=new Map()

const io=new Server(server,{
    cors:{
        origin:'*',
        methods:['GET','POST']
    }
})

io.on('connection',(socket)=>{
    console.log('client connected :- ',socket.id)

    socket.on('addUser',(obj)=>{
        if (!obj || !obj._id) return;
        if(!user.has(obj._id.toString())){
            user.set(obj._id.toString(),{details:null,socketId:new Set()})
        }
        user.get(obj._id.toString()).socketId.add(socket.id)
        user.get(obj._id.toString()).details=obj
        const onlineUser = [...user.values()].map(ele => ele.details);
        io.emit('getUser',onlineUser)
    })

    socket.on('sendMessage',(obj)=>{
        const senderSockets=user.get(obj.senderId.toString())?.socketId
        if(senderSockets){
            for(const ele of senderSockets){
                if(ele!=socket.id) socket.to(ele).emit('receiveMyMessage',obj)
            }
        }
        const sockets=user.get(obj.receiverId.toString())?.socketId
        if(sockets){
            for(const ele of sockets){
                socket.to(ele).emit('receiveMessage',obj)
            }
        }
        createServerDbMessage(obj)
    })

    socket.on('sendImage',(obj)=>{
        const senderSockets=user.get(obj.senderId.toString())?.socketId
        if(senderSockets){
            for(const ele of senderSockets){
                if(ele!=socket.id) socket.to(ele).emit('receiveMyImage',obj)
            }
        }
        const sockets=user.get(obj.receiverId.toString())?.socketId
        if(sockets){
            for(const ele of sockets){
                socket.to(ele).emit('receiveImage',obj)
            }
        }
    })

    socket.on('sendTypingMessage',(obj)=>{
        const sockets=user.get(obj.receiverId.toString())?.socketId
        if(sockets){
            for(const ele of sockets){
                socket.to(ele).emit('receiveTypingMessage',obj)
            }
        }
    })

    socket.on('sendSeenMessage',(obj)=>{
        const senderSockets=user.get(obj.myId.toString())?.socketId
        if(senderSockets){
            for(const ele of senderSockets){
                if(ele!=socket.id) socket.to(ele).emit('receiveSeenMessage',obj)
            }
        }
        ServerSeenMessage({_id:obj.messageId})
    })

    socket.on('disconnect',()=>{
        for(const [userId,data] of user.entries()){
            data.socketId.delete(socket.id)
            if(data.socketId.size==0) user.delete(userId)
        }
        const onlineUser = [...user.values()].map(ele => ele.details);
        io.emit('getUser',onlineUser)
        
    })
})





dbConnet()
.then(()=>{
    server.listen(port,()=>{
    console.log(`server is listening at port ${port}`)
    })
    cloudinaryConnect()
})
.catch((err)=>{
    console.log('db connection fail')
    process.exit(1)
})





