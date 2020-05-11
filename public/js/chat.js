const socket = io();

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.inputMessage.value;
    socket.emit('sendMessage',message,(error)=>{
        if(error){
            return console.log(error);
        }
        console.log(message);
    });
})
document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Your web browser does not support for sending location')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', `https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,(deliveryStatus)=>{
            console.log("Location ",deliveryStatus);
        });
    })
})
socket.on('message', (message) => {
    console.log(message);
})
