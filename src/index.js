const express=require('express')
const http=require('http');
const Filter = require('bad-words')
const socketio=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=socketio(server);
const path=require('path');
const {generateMessage,generateLocationMessage}=require('./utils/message');
const { addUser, removeUser, getUser, getUserInRoom}=require('./utils/users');
const port=process.env.PORT || 3000;
const publicDirectoryPath=path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));
io.on('connection',(socket)=>{

    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser(socket.id,username,room);
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Admin','Welcome User!!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        console.log(getUserInRoom(user.room));
        callback();
    })

    socket.on('sendMessage', (message,callback) => {
        const user=getUser(socket.id);
        const filter=new Filter();
        filter.addWords("chutiya");
        filter.addWords("chutiye");
        if(filter.isProfane(message)){
            return callback("Bad Words are not allowed");
        }
        io.to(user.room).emit('message', generateMessage(user.username,message));
        callback();
    })
    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,coords));
        callback("Delivered");
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left the room`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }


    })
})

server.listen(port,()=>{
    console.log("server is listening on ",port);
})