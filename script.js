// 1. Get DOM Elements (نجيب العناصر اللي هنشتغل عليها من الـ HTML)
const taskInput = document.getElementById('taskInput'); // لازم الـ id بتاع الـ input يكون "taskInput"
const addTaskBtn = document.getElementById('addTaskBtn'); // لازم الـ id بتاع زرار الإضافة يكون "addTaskBtn"
const taskList = document.getElementById('taskList');   // لازم الـ id بتاع القائمة يكون "taskList" (ده ul او div عندك في الـ HTML)

// Base URL for your Backend API
const API_BASE_URL = 'http://localhost:3000/api/tasks'; // ده العنوان بتاع الـ Backend بتاعك

// --- (1) Function to fetch and display tasks (دالة بتجيب المهام من الـ Backend وتعرضها) ---
async function fetchTasks() {
    try {
        const response = await fetch(API_BASE_URL); // بتبعت GET request للـ Backend بتاعك
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json(); // بتاخد الرد JSON وتحوله لـ JavaScript Array
        displayTasks(tasks); // بتعرض المهام في واجهة المستخدم
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Failed to load tasks. Please try again later.');
    }
}

// Function to display tasks in the UI (دالة لعرض المهام في الـ HTML)
function displayTasks(tasks) {
    taskList.innerHTML = ''; // بتفضي القائمة الموجودة عشان تعرض المهام الجديدة

    if (tasks.length === 0) {
        taskList.innerHTML = '<p>No tasks yet. Add one!</p>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item'; // كلاس الـ Style الأساسي للمهمة
        li.setAttribute('data-id', task._id); // عشان نربط الـ ID بتاع المهمة بالـ HTML

        // لو المهمة مكتملة، نضيفلها كلاس "completed"
        if (task.completed) {
            li.classList.add('completed');
        }

        // نص المهمة
        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = 'task-title'; // كلاس للـ Styling (عشان اللون والخط)
        taskTextSpan.textContent = task.text;

        // قسم الأزرار (task-actions) اللي الـ CSS بتاعك مصمم ليها
        const taskActionsDiv = document.createElement('div');
        taskActionsDiv.className = 'task-actions';

        // زرار Complete/Undo
        const completeButton = document.createElement('button');
        completeButton.className = 'complete-btn'; // كلاس للـ Styling
        completeButton.textContent = task.completed ? 'Undo' : 'Complete'; // النص هيتغير حسب الحالة (مكتملة أو لأ)
        completeButton.addEventListener('click', () => toggleTaskCompleted(task._id, !task.completed));

        // زرار الحذف
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-btn'; // كلاس للـ Styling
        deleteButton.addEventListener('click', () => deleteTask(task._id));

        // نضيف الأزرار للـ div بتاع task-actions
        taskActionsDiv.appendChild(completeButton);
        taskActionsDiv.appendChild(deleteButton);

        // نضيف العناصر الأساسية (النص و الـ div بتاع الأزرار) للـ <li>
        li.appendChild(taskTextSpan);
        li.appendChild(taskActionsDiv);

        // نضيف الـ <li> اللي عملناه ده لقائمة المهام الرئيسية في الـ HTML
        taskList.appendChild(li);
    });
}

// --- (2) Function to add a new task (دالة لإضافة مهمة جديدة) ---
async function addTask() {
    const text = taskInput.value.trim(); // ناخد النص من صندوق الإدخال ونشيل المسافات الزايدة
    if (!text) { // لو النص فاضي، نظهر رسالة ونخرج
        alert('Task cannot be empty!');
        return;
    }

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST', // نوع الطلب HTTP هيكون POST عشان نضيف حاجة جديدة
            headers: {
                'Content-Type': 'application/json' // بنقول للسيرفر إننا باعتين بيانات بصيغة JSON
            },
            body: JSON.stringify({ text }) // نحول الـ JavaScript object { text: "..." } لـ JSON string عشان نبعته في الـ body
        });

              // للتأكد، هنشوف الـ status Code بشكل صريح.
              if (response.status === 201 || response.status === 200) { // لو الرد 201 (Created) أو 200 (OK)
                // لو عايزة تقري الـ JSON بتاع الرد بس عشان تسجليها في الـ Console مثلاً:
                // const newTask = await response.json();
                // console.log('Task added successfully:', newTask);
    
                taskInput.value = ''; // نفضي صندوق الإدخال عشان اليوزر يكتب مهمة جديدة
                fetchTasks(); // نعيد تحميل المهام من السيرفر عشان تظهر المهمة الجديدة اللي لسه ضايفينها
            } else {
                // لو الرد مش 200 أو 201، يبقى فيه مشكلة. نقرا الخطأ لو كان فيه JSON
                const errorData = await response.json().catch(() => ({ message: `Server error with status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
    
        } catch (error) {
            console.error('Error adding task:', error); // نسجل الخطأ في الـ Console
            alert(`Failed to add task: ${error.message}`); // نظهر رسالة خطأ للمستخدم (دي اللي هتظهر لو فيه مشكلة حقيقية)
        }
    }
// --- (3) Function to toggle task completion status (دالة لتغيير حالة المهمة بين مكتملة وغير مكتملة) ---
async function toggleTaskCompleted(id, completedStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { // نبعت طلب PUT للـ ID بتاع المهمة دي عشان نحدثها
            method: 'PUT', // نوع الطلب HTTP هيكون PUT عشان نحدث بيانات موجودة
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: completedStatus }) // نبعت في الـ body بس حالة الإكمال الجديدة (true/false)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        fetchTasks(); // نعيد تحميل المهام عشان التغيير في حالة المهمة يظهر على طول
    } catch (error) {
        console.error('Error updating task:', error);
        alert(`Failed to update task: ${error.message}`);
    }
}

// --- (4) Function to delete a task (دالة لحذف مهمة) ---
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) { // نسأل المستخدم يتأكد قبل الحذف
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { // نبعت طلب DELETE للـ ID بتاع المهمة عشان نحذفها
            method: 'DELETE' // نوع الطلب HTTP هيكون DELETE
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        fetchTasks(); // نعيد تحميل المهام عشان المهمة المحذوفة تختفي من القائمة
    } catch (error) {
        console.error('Error deleting task:', error);
        alert(`Failed to delete task: ${error.message}`);
    }
}

// --- (5) Event Listeners (ربط الأزرار والأحداث بالدوال) ---
addTaskBtn.addEventListener('click', addTask); // لما ندوس على زرار "Add Task"، ننادي دالة addTask

// عشان نضيف المهمة بالـ Enter كمان لما اليوزر يكتب في صندوق الإدخال ويدوس Enter
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initial load of tasks when the page loads (أول ما الصفحة تحمل، نجيب المهام من الـ Backend ونعرضها)
fetchTasks();