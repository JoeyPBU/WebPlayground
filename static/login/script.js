document.querySelector('#login-btn').addEventListener('click', (event) => {
    event.preventDefault();

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/brandy';
        } else {
            alert('Invalid username or password');
        }
    })
    .catch(error => {
        alert('An error occurred. Please try again.');
        console.error(error);
    });
});

document.querySelector('#sign-up-btn').addEventListener('click', () => {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        if (response.ok) {
            alert('Sign up successful!');
        } else {
            alert('Sign up failed. Please try again.');
        }
    })
    .catch(error => {
        alert('An error occurred. Please try again.');
        console.error(error);
    });
});


document.querySelector('#username').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.querySelector('#password').focus();
    }
});

document.querySelector('#password').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.querySelector('#login-btn').click();
    }
});