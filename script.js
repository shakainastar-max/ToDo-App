const defaultTasks = [];

const saved = localStorage.getItem("tasks");
let tasks = saved ? JSON.parse(saved) : defaultTasks;

// console.log(tasks);

const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const filterButtons = document.querySelectorAll("[data-filter]");
const sortSelect = document.getElementById("sort");

const menuBtn = document.getElementById("menu-btn");
const overlay = document.getElementById("overlay");
const sidebar = document.querySelector("aside");

let currentFilter = "all";
let currentSort = "due-date";

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCounts() {
    const total = tasks.length;
    const completed = tasks.filter(function (t) {
        return t.completed;
    }).length;
    const active = total - completed;

    document.getElementById("count-all").textContent = total;
    document.getElementById("count-active").textContent = active;
    document.getElementById("count-completed").textContent = completed;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-completed").textContent = completed;
    document.getElementById("stat-active").textContent = active;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById("progress-bar").style.width = percent + "%";
    document.getElementById("progress-text").textContent = percent + "%";
}

function renderTasks() {
    taskList.innerHTML = "";

    const visible = tasks.filter(function (task) {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    if (currentSort === "priority") {
        // 2. sort it (NEW)
        const order = { high: 1, medium: 2, low: 3 };
        visible.sort(function (a, b) {
            return order[a.priority] - order[b.priority];
        });
    }

    visible.forEach(function (task) {
        taskList.innerHTML += `
        <li class="task ${task.completed ? "completed" : ""}" data-id="${task.id}">
            <input type="checkbox" ${task.completed ? "checked" : ""} />
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
            </div>
            <span class="due-date">${task.dueDate}</span>
            <span class="badge ${task.priority}">${task.priority}</span>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </li>
    `;
    });
    updateCounts();
}

function updateHeader() {
    const now = new Date();
    const hour = now.getHours();

    let greeting;
    if (hour < 12) {
        greeting = "Good morning!";
    } else if (hour < 18) {
        greeting = "Good afternoon!"; // your turn
    } else {
        greeting = "Good evening!"; // your turn
    }

    document.getElementById("greeting").textContent = greeting;

    document.getElementById("current-date").textContent =
        now.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
}

updateHeader();
renderTasks();

taskList.addEventListener("click", function (e) {
    if (e.target.type === "checkbox") {
        const li = e.target.closest("li");
        const id = li.dataset.id;

        const task = tasks.find(function (t) {
            return t.id === Number(id);
        });

        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }

    if (e.target.classList.contains("delete-btn")) {
        const li = e.target.closest("li");
        const id = li.dataset.id;

        tasks = tasks.filter(function (t) {
            return t.id !== Number(id);
        });
        saveTasks();
        renderTasks();
    }

    if (e.target.classList.contains("edit-btn")) {
        const li = e.target.closest("li");
        const id = li.dataset.id;

        const task = tasks.find(function (t) {
            return t.id === Number(id);
        });

        const newTitle = prompt("Edit task:", task.title);

        if (newTitle !== null && newTitle.trim() !== "") {
            task.title = newTitle.trim();
        }
        saveTasks();
        renderTasks();
    }
});

taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const text = taskInput.value.trim();
    if (text === "") return;

    const newTask = {
        id: Date.now(),
        title: text,
        description: "",
        dueDate: "Today",
        priority: "medium",
        completed: false,
    };

    tasks.push(newTask);
    taskInput.value = "";
    saveTasks();
    renderTasks();
});

filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        currentFilter = btn.dataset.filter;
        filterButtons.forEach(function (b) {
            const isActive = b.dataset.filter === currentFilter;
            const li = b.closest("li");

            if (li) {
                li.classList.toggle("active", isActive);
            } else {
                b.classList.toggle("active", isActive);
            }
        });
        renderTasks();
        closeMenu();
    });
});

sortSelect.addEventListener("change", function () {
    currentSort = sortSelect.value;
    renderTasks();
});

function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
}

menuBtn.addEventListener("click", function () {
    sidebar.classList.add("open");
    overlay.classList.add("show");
});

overlay.addEventListener("click", closeMenu);
