// 1. Get DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const alertMessageDiv = document.getElementById('alertMessage');

// Base URL for your Backend API
const API_BASE_URL = 'https://backend-task-manager-app.onrender.com/api/tasks';
// دالة لعرض رسالة Bootstrap Alert
function showAlert(message, type = 'danger') {
    alertMessageDiv.textContent = message;
    alertMessageDiv.className = `alert alert-${type}`;
    alertMessageDiv.classList.remove('d-none');
    setTimeout(() => {
        alertMessageDiv.classList.add('d-none');
    }, 3000);
}

// Function to handle logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Function to display tasks in the UI
function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="list-group-item text-center text-muted">No tasks yet. Add one!</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item list-group-item d-flex justify-content-between align-items-center';
        li.setAttribute('data-id', task._id);

        if (task.completed) {
            li.classList.add('completed');
        }

        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = 'task-title flex-grow-1';
        taskTextSpan.textContent = task.text;

        const taskActionsDiv = document.createElement('div');
        taskActionsDiv.className = 'task-actions d-flex';

        const completeButton = document.createElement('button');
        completeButton.className = `btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-info'} me-2 complete-btn`;
        completeButton.textContent = task.completed ? 'Undo' : 'Complete';
        completeButton.addEventListener('click', () => toggleTaskCompleted(task._id, !task.completed));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm delete-btn';
        deleteButton.addEventListener('click', () => deleteTask(task._id));

        taskActionsDiv.appendChild(completeButton);
        taskActionsDiv.appendChild(deleteButton);
        li.appendChild(taskTextSpan);
        li.appendChild(taskActionsDiv);
        taskList.appendChild(li);
    });
}

// Fetch tasks from the backend (Corrected)
async function fetchTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('You are not logged in. Redirecting to login page.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    try {
        const response = await fetch(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                showAlert('Session expired or not logged in. Please log in again.', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
            throw new Error('Failed to load tasks.');
        }
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showAlert('Failed to load tasks. Please log in again.', 'danger');
    }
}

// Add a new task (Corrected)
async function addTask(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const text = taskInput.value;
    if (!text) {
        showAlert('Task text is required!', 'warning');
        return;
    }

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error('Failed to add task.');
        }
        taskInput.value = '';
        fetchTasks();
    } catch (error) {
        console.error('Error adding task:', error);
        showAlert('Failed to add task. Please try again.', 'danger');
    }
}

// Toggle a task's completion status (Corrected)
async function toggleTaskCompleted(id, completed) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed: completed })
        });

        if (!response.ok) {
            throw new Error('Failed to update task.');
        }
        fetchTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        showAlert('Failed to update task. Please try again.', 'danger');
    }
}

// Delete a task (Corrected)
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete task.');
        }
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        showAlert('Failed to delete task. Please try again.', 'danger');
    }
}

// Event Listeners for the form and logout button
document.getElementById('taskForm').addEventListener('submit', addTask);
// You'll need to add a logout button to your index.html with id="logoutBtn"
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// Initial load of tasks when the page loads
fetchTasks();