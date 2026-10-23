const STORAGE_KEY = "smart-task-dashboard";

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const list = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const clearDoneBtn = document.getElementById("clearDone");
const filterButtons = document.querySelectorAll("[data-filter]");

const statTotal = document.getElementById("statTotal");
const statActive = document.getElementById("statActive");
const statDone = document.getElementById("statDone");

const PRIORITY_LABELS = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

let tasks = loadTasks();
let filter = "all";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    priority: priorityInput.value,
    done: false,
    createdAt: Date.now(),
  });

  input.value = "";
  persist();
  render();
  input.focus();
});

list.addEventListener("click", (event) => {
  const taskEl = event.target.closest(".task");
  if (!taskEl) return;

  const id = taskEl.dataset.id;

  if (event.target.closest(".task__check")) {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    persist();
    render();
  }

  if (event.target.closest(".task__delete")) {
    tasks = tasks.filter((task) => task.id !== id);
    persist();
    render();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

clearDoneBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.done);
  persist();
  render();
});

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function visibleTasks() {
  if (filter === "active") return tasks.filter((task) => !task.done);
  if (filter === "done") return tasks.filter((task) => task.done);
  return tasks;
}

function render() {
  const visible = visibleTasks();
  const doneCount = tasks.filter((task) => task.done).length;

  statTotal.textContent = String(tasks.length);
  statActive.textContent = String(tasks.length - doneCount);
  statDone.textContent = String(doneCount);

  list.innerHTML = visible
    .map(
      (task) => `
        <li class="task ${task.done ? "is-done" : ""}" data-id="${task.id}">
          <button class="task__check" type="button" aria-label="Переключить статус">
            ✓
          </button>
          <p class="task__title">${escapeHtml(task.title)}</p>
          <span class="priority priority--${task.priority}">${PRIORITY_LABELS[task.priority]}</span>
          <button class="task__delete" type="button" aria-label="Удалить задачу">×</button>
        </li>
      `
    )
    .join("");

  emptyState.classList.toggle("is-visible", visible.length === 0);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

render();
