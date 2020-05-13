const express=require('express')
const http=require('http');
const Filter = require('bad-words')
const socketio=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=socketio(server);
const path=require('path');
const {generateMessage,generateLocationMessage}=require('./utils/message');
const port=3000||process.env.PORT;
const publicDirectoryPath=path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));
io.on('connection',(socket)=>{
    socket.emit('message', generateMessage('Welcome User!!'));
    socket.broadcast.emit('message', generateMessage('A new user has joined'))
    socket.on('sendMessage', (message,callback) => {
        const filter=new Filter();
        filter.addWords("chutiya");
        filter.addWords("chutiye");
        if(filter.isProfane(message)){
            return callback("Bad Words are not allowed");
        }
        io.emit('message', generateMessage(message));
        callback();
    })
    socket.on('sendLocation',(coords,callback)=>{
        io.emit('locationMessage', generateLocationMessage(coords));
        callback("Delivered");
    })
    socket.on('disconnect',()=>{
        io.emit('message', generateMessage('A user has left the chat room'))
    })
})

server.listen(port,()=>{
    console.log("server is listening on ",port);
})