let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

//function 
menu.onclick = () =>{
menu.classList.toggle('fa-times');
navbar.classList.toogle('active')
}

window.onscroll = () =>{
    menu.classList.remove ('fa-times');
    navbar.classList.remove ('fa-times');
    }