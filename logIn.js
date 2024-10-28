const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');

signupForm.addEventListener('submit', function (event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Save user info to db.json
    fetch('http://localhost:3005/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone })
    })
    .then(response => response.json())
    .then(data => {
        messageDiv.textContent = 'Sign up successful! Please log in.';
        signupForm.reset();
    })
    .catch(error => {
        messageDiv.textContent = 'Error signing up. Please try again.';
        console.error('Error:', error);
    });
});

loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;

    // Check if the user exists
    fetch('http://localhost:3005/users')
    .then(response => response.json())
    .then(users => {
        const user = users.find(u => u.email === email);
        if (user) {
            // Redirect to chatbot page
            window.location.href = 'chatbot.html'; // Change to your chatbot page
        } else {
            messageDiv.textContent = 'User not found. Please sign up.';
        }
    })
    .catch(error => {
        messageDiv.textContent = 'Error logging in. Please try again.';
        console.error('Error:', error);
    });
});
