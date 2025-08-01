// API Base URL (Update this with your Render backend URL)
const API_BASE_URL = 'https://backend-task-manager-app.onrender.com/api';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const logoutBtn = document.getElementById('logoutBtn');
const alertMessage = document.getElementById('alertMessage');

// Event Listeners
if (taskForm) {
    taskForm.addEventListener('submit', addTask);
}
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}
if (taskList) {
    taskList.addEventListener('click', handleTaskActions);
}

// Check for token and redirect if not present
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname.includes('tasks.html')) {
        window.location.href = 'login.html';
    }
    if (token && window.location.pathname.includes('tasks.html')) {
        fetchTasks();
    }
});

// Show alert message
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.classList.remove('d-none');
    setTimeout(() => {
        alertMessage.classList.add('d-none');
    }, 5000);
}

// Handle task actions (complete, delete)
async function handleTaskActions(e) {
    const target = e.target;
    if (target.classList.contains('delete-btn')) {
        const taskId = target.dataset.id;
        await deleteTask(taskId);
    } else if (target.classList.contains('complete-btn')) {
        const taskId = target.dataset.id;
        await toggleTaskComplete(taskId);
    }
}

// Logout user
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Fetch all tasks
async function fetchTasks() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 401) {
            logout();
            return;
        }
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showAlert('Failed to load tasks. Please try again.', 'danger');
    }
}

// Render tasks to the DOM
function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="list-group-item text-center">No tasks yet. Add one!</li>';
    }
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `list-group-item d-flex justify-content-between align-items-center ${task.completed ? 'text-decoration-line-through text-muted' : ''}`;
        li.innerHTML = `
            <span>${task.description}</span>
            <div>
                <button class="btn btn-sm ${task.completed ? 'btn-warning' : 'btn-success'} complete-btn me-2" data-id="${task._id}">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${task._id}">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Add a new task
async function addTask(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const description = taskInput.value.trim();
    if (!description) {
        showAlert('Task description is required!', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add task');
        }
        taskInput.value = '';
        fetchTasks();
    } catch (error) {
        console.error('Error adding task:', error);
        showAlert(`Failed to add task: ${error.message}`, 'danger');
    }
}

// Toggle task completion status
async function toggleTaskComplete(taskId) {
    const token = localStorage.getItem('token');
    const taskItem = document.querySelector(`[data-id="${taskId}"]`).closest('li');
    const isCompleted = !taskItem.classList.contains('text-decoration-line-through');

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed: isCompleted })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update task');
        }
        fetchTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        showAlert(`Failed to update task: ${error.message}`, 'danger');
    }
}

// Delete a task
async function deleteTask(taskId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete task');
        }
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        showAlert(`Failed to delete task: ${error.message}`, 'danger');
    }
}