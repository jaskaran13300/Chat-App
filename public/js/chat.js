const socket = io();
const $messageForm=document.querySelector('#message-form');
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages=document.querySelector('#messages');

const $messageTemplate=document.querySelector('#message-template').innerHTML;

socket.on('message', (message) => {
    const html=Mustache.render($messageTemplate,{
        message
    });
    $messages.insertAdjacentHTML('beforeend',html);
    console.log(message);
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageForm.setAttribute('disabled','disabled');
    const message = e.target.elements.inputMessage.value;
    socket.emit('sendMessage',message,(error)=>{
        $messageForm.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
        console.log("Message Delivered");
    });
})
$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Your web browser does not support for sending location')
    }
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', `https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,(deliveryStatus)=>{
            $sendLocationButton.removeAttribute('disabled');
            console.log("Location ",deliveryStatus);
        });
    })
})
