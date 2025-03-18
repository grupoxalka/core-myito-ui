document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    window.location.href = '../home/home.html';
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('button').click();
    }
});