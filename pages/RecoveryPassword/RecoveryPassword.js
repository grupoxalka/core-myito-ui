const tittle = document.querySelector('.upper-item-title');
const text = document.querySelector('.text');
const email = document.querySelector('.email');
const lowerItem = document.querySelector('.lower-item');
const button = document.querySelector('.button');
let canReturn = false;

button.addEventListener('click', () => {
    if (canReturn) {
        window.location.href = '../Login/Login.html';
    }
    if (email.value !== '') {
        tittle.textContent = 'Solicitud enviada con éxito';
        text.style.display = 'none';
        email.style.display = 'none';
        lowerItem.style.display = 'none';
        button.value = 'Volver al inicio de sesión';
        canReturn = true;
    }
});

