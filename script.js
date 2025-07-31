// 1. Get DOM Elements (نجيب العناصر اللي هنشتغل عليها من الـ HTML)
const taskInput = document.getElementById('taskInput'); // لازم الـ id بتاع الـ input يكون "taskInput"
const addTaskBtn = document.getElementById('addTaskBtn'); // لازم الـ id بتاع زرار الإضافة يكون "addTaskBtn"
const taskList = document.getElementById('taskList');   // لازم الـ id بتاع القائمة يكون "taskList" (ده ul او div عندك في الـ HTML)
const alertMessageDiv = document.getElementById('alertMessage'); // استهداف عنصر الـ Alert الجديد من الـ HTML

// Base URL for your Backend API
const API_BASE_URL = 'https://backend-task-manager-app.onrender.com/api/tasks';

// دالة لعرض رسالة Bootstrap Alert
function showAlert(message, type = 'danger') { // type يمكن أن تكون 'success', 'danger', 'info', 'warning'
    alertMessageDiv.textContent = message;
    alertMessageDiv.className = `alert alert-${type}`; // تغيير الكلاس للون ونوع الـ Alert
    alertMessageDiv.classList.remove('d-none'); // إظهار الـ Alert

    // إخفاء الـ Alert بعد 3 ثواني
    setTimeout(() => {
        alertMessageDiv.classList.add('d-none'); // إخفاء الـ Alert
    }, 3000); // 3000 مللي ثانية = 3 ثواني
}

// دالة لجلب المهام من الـ API
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
        showAlert('Failed to load tasks. The server might be waking up or there is a network issue. Please try again.', 'danger'); // استخدام الـ showAlert
    }
}

// Function to display tasks in the UI (دالة لعرض المهام في الـ HTML)
function displayTasks(tasks) {
    taskList.innerHTML = ''; // بتفضي القائمة الموجودة عشان تعرض المهام الجديدة

    if (tasks.length === 0) {
        // رسالة للـ Empty State باستخدام Bootstrap classes
        taskList.innerHTML = '<li class="list-group-item text-center text-muted">No tasks yet. Add one!</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        // هنا هنضيف كلاسات Bootstrap للـ List Group Items
        li.className = 'task-item list-group-item d-flex justify-content-between align-items-center';
        li.setAttribute('data-id', task._id); // عشان نربط الـ ID بتاع المهمة بالـ HTML

        // لو المهمة مكتملة، نضيفلها كلاس "completed"
        if (task.completed) {
            li.classList.add('completed');
        }

        // نص المهمة
        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = 'task-title flex-grow-1'; // أضفنا flex-grow-1 لكلاس Bootstrap
        taskTextSpan.textContent = task.text;

        // قسم الأزرار (task-actions) اللي الـ CSS بتاعك مصمم ليها
        const taskActionsDiv = document.createElement('div');
        taskActionsDiv.className = 'task-actions d-flex'; // أضفنا d-flex لكلاس Bootstrap

        // زرار Complete/Undo
        const completeButton = document.createElement('button');
        // استخدمنا كلاسات Bootstrap للأزرار
        completeButton.className = `btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-info'} me-2 complete-btn`;
        completeButton.textContent = task.completed ? 'Undo' : 'Complete'; // النص هيتغير حسب الحالة (مكتملة أو لأ)
        completeButton.addEventListener('click', () => toggleTaskCompleted(task._id, !task.completed));

        // زرار الحذف
        const deleteButton = document.createElement('button');
        // استخدمنا كلاسات Bootstrap للأزرار
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm delete-btn';
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
        showAlert('Task cannot be empty!', 'warning'); // استخدام الـ showAlert
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
            taskInput.value = ''; // نفضي صندوق الإدخال عشان اليوزر يكتب مهمة جديدة
            await fetchTasks(); // نعيد تحميل المهام من السيرفر عشان تظهر المهمة الجديدة اللي لسه ضايفينها
            showAlert('Task added successfully!', 'success'); // رسالة نجاح
        } else {
            // لو الرد مش 200 أو 201، يبقى فيه مشكلة. نقرا الخطأ لو كان فيه JSON
            const errorData = await response.json().catch(() => ({ message: `Server error with status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Error adding task:', error); // نسجل الخطأ في الـ Console
        showAlert(`Failed to add task: ${error.message}. The server might be waking up or there is a network issue. Please try again.`, 'danger'); // استخدام الـ showAlert
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
            const errorData = await response.json().catch(() => ({ message: `Server error with status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        await fetchTasks(); // نعيد تحميل المهام عشان التغيير في حالة المهمة يظهر على طول
        showAlert('Task status updated successfully!', 'info'); // رسالة تحديث حالة
    } catch (error) {
        console.error('Error updating task:', error);
        showAlert(`Failed to update task: ${error.message}. Please try again.`, 'danger'); // استخدام الـ showAlert
    }
}

// --- (4) Function to delete a task (دالة لحذف مهمة) ---
async function deleteTask(id) {
    // استبدلنا الـ confirm() بـ showAlert مؤقتاً
    // ممكن في المستقبل نستخدم Bootstrap Modal لتأكيد الحذف بشكل أفضل
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { // نبعت طلب DELETE للـ ID بتاع المهمة عشان نحذفها
            method: 'DELETE' // نوع الطلب HTTP هيكون DELETE
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Server error with status: ${response.status}` }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        await fetchTasks(); // نعيد تحميل المهام عشان المهمة المحذوفة تختفي من القائمة
        showAlert('Task deleted successfully!', 'success'); // رسالة حذف
    } catch (error) {
        console.error('Error deleting task:', error);
        showAlert(`Failed to delete task: ${error.message}. Please try again.`, 'danger'); // استخدام الـ showAlert
    }
}

// --- (5) Event Listeners (ربط الأزرار والأحداث بالدوال) ---
// بدل ما نربط الزرار بـ addTask مباشرة، نربطه بـ event listener على الـ form
// عشان نقدر نمنع الـ default behavior بتاع الـ form (إعادة تحميل الصفحة)
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    addTask();
});

// Initial load of tasks when the page loads (أول ما الصفحة تحمل، نجيب المهام من الـ Backend ونعرضها)
fetchTasks();