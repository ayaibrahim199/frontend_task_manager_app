// Get DOM Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const alertMessageDiv = document.getElementById('alertMessage');

// Base URL for the Backend Authentication API
const API_BASE_URL = 'https://backend-task-manager-app.onrender.com/api/auth';

// Function to show a Bootstrap Alert
function showAlert(message, type = 'danger') {
    alertMessageDiv.textContent = message;
    alertMessageDiv.className = `alert alert-${type}`;
    alertMessageDiv.classList.remove('d-none');
    setTimeout(() => {
        alertMessageDiv.classList.add('d-none');
    }, 3000);
}

// Function to handle user registration
async function handleRegister(e) {
    e.preventDefault(); // Prevent page reload

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        showAlert('Please fill in all fields!', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Registration successful! You can now log in.', 'success');
            // NEW: Redirect to login page
            window.location.href = 'login.html';
        } else {
            throw new Error(data.message || `Error with status: ${response.status}`);
        }

    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message, 'danger');
    }
}
// NEW: Function to handle user login
async function handleLogin(e) {
    e.preventDefault(); // Prevent page reload

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        showAlert('Please fill in all fields!', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Here we store the token
            localStorage.setItem('token', data.token);
            showAlert('Login successful! Redirecting...', 'success');
            // Redirect to the main tasks page
            window.location.href = 'index.html';
        } else {
            throw new Error(data.message || `Error with status: ${response.status}`);
        }

    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message, 'danger');
    }
}

// Event Listeners for the forms
if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}