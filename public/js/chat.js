const socket = io();
const $messageForm=document.querySelector('#message-form');
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages=document.querySelector('#messages');

const $messageTemplate=document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

socket.emit('join',{username,room},(error)=>{
    if(error){
        location.href = '/';
        alert(error);
    }
});

const autoscroll=()=>{
    // new message element
    const $newMessage=$messages.lastElementChild
    // height of new message
    newMessageStyles=getComputedStyle($newMessage);
    newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    // visible height
    const visibleHeight=$messages.offsetHeight;

    // height of message container
    const containerHeight=$messages.scrollHeight;

    // how far I scrolled
    const scrollOffset=$messages.scrollTop+visibleHeight;
    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationMessage',(message)=>{
    const html = Mustache.render($locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('roomData',({room,users})=>{
    console.log(users);
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
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
