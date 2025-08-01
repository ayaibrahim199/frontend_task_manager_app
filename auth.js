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

// Function to handle user registration (Corrected)
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

        if (response.ok) {
            showAlert('Registration successful! You can now log in.', 'success');
            window.location.href = 'login.html';
        } else {
            const errorText = await response.text();
            throw new Error(errorText || `Error with status: ${response.status}`);
        }

    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message, 'danger');
    }
}

// Function to handle user login (Corrected)
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

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            showAlert('Login successful! Redirecting...', 'success');
            window.location.href = 'tasks.html';
        } else {
            const errorText = await response.text();
            throw new Error(errorText || `Error with status: ${response.status}`);
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