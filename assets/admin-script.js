// ===========================
// Admin Panel Configuration
// ===========================

const ADMIN_PASSWORD = "Kmn89@me"; // CHANGE THIS!
const STORAGE_KEY = "galleryApps";
const AUTH_KEY = "galleryAuth";

// ===========================
// State Management
// ===========================

let currentGallery = "games";
let galleries = {
  games: { name: "Games", apps: [] },
  chemistry: { name: "Chemistry", apps: [] },
  quiz: { name: "Quiz", apps: [] }
};

// ===========================
// Authentication
// ===========================

function checkAuth() {
  const auth = sessionStorage.getItem(AUTH_KEY);
  return auth === "authenticated";
}

function login(password) {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, "authenticated");
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  location.reload();
}

// ===========================
// DOM Elements
// ===========================

const loginScreen = document.getElementById("login-screen");
const adminInterface = document.getElementById("admin-interface");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const passwordInput = document.getElementById("password-input");

const galleryTabs = document.getElementById("gallery-tabs");
const appsGrid = document.getElementById("apps-grid");
const emptyState = document.getElementById("empty-state");

const toggleAddFormBtn = document.getElementById("toggle-add-form");
const addAppForm = document.getElementById("add-app-form");
const newAppForm = document.getElementById("new-app-form");
const cancelAddFormBtn = document.getElementById("cancel-add-form");

const editModal = document.getElementById("edit-modal");
const editAppForm = document.getElementById("edit-app-form");
const closeEditModalBtn = document.getElementById("close-edit-modal");
const cancelEditModalBtn = document.getElementById("cancel-edit-modal");

const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const logoutBtn = document.getElementById("logout-btn");
const addGalleryBtn = document.getElementById("add-gallery-btn");

// ===========================
// Initialization
// ===========================

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  
  if (checkAuth()) {
    showAdminInterface();
  } else {
    showLoginScreen();
  }
});

function showLoginScreen() {
  loginScreen.style.display = "flex";
  adminInterface.style.display = "none";
}

function showAdminInterface() {
  loginScreen.style.display = "none";
  adminInterface.style.display = "block";
  loadData();
  renderTabs();
  renderApps();
  lucide.createIcons();
}

// ===========================
// Login Handler
// ===========================

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const password = passwordInput.value;
  
  if (login(password)) {
    showAdminInterface();
  } else {
    loginError.textContent = "Incorrect password";
    loginError.classList.add("show");
    passwordInput.value = "";
    passwordInput.focus();
    
    setTimeout(() => {
      loginError.classList.remove("show");
    }, 3000);
  }
});

logoutBtn.addEventListener("click", logout);

// ===========================
// Data Management
// ===========================

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      galleries = JSON.parse(stored);
    } catch (e) {
      console.error("Error loading data:", e);
      showToast("Error loading data", "error");
    }
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(galleries));
}

// ===========================
// Gallery Management
// ===========================

function renderTabs() {
  galleryTabs.innerHTML = "";
  
  Object.keys(galleries).forEach(galleryId => {
    const tab = document.createElement("button");
    tab.className = "tab";
    if (galleryId === currentGallery) {
      tab.classList.add("active");
    }
    
    tab.innerHTML = `
      ${galleries[galleryId].name}
      <span class="delete-gallery" data-gallery="${galleryId}">✕</span>
    `;
    
    tab.addEventListener("click", (e) => {
      if (!e.target.classList.contains("delete-gallery")) {
        currentGallery = galleryId;
        renderTabs();
        renderApps();
      }
    });
    
    // Delete gallery handler
    const deleteBtn = tab.querySelector(".delete-gallery");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteGallery(galleryId);
    });
    
    galleryTabs.appendChild(tab);
  });
  
  lucide.createIcons();
}

function deleteGallery(galleryId) {
  if (Object.keys(galleries).length === 1) {
    showToast("Cannot delete the last gallery", "error");
    return;
  }
  
  if (confirm(`Delete gallery "${galleries[galleryId].name}"? All apps will be removed.`)) {
    delete galleries[galleryId];
    
    // Switch to first available gallery
    currentGallery = Object.keys(galleries)[0];
    
    saveData();
    renderTabs();
    renderApps();
    showToast("Gallery deleted", "success");
  }
}

addGalleryBtn.addEventListener("click", () => {
  const name = prompt("Enter gallery name:");
  if (!name) return;
  
  const id = name.toLowerCase().replace(/\s+/g, "-");
  
  if (galleries[id]) {
    showToast("Gallery already exists", "error");
    return;
  }
  
  galleries[id] = { name, apps: [] };
  currentGallery = id;
  
  saveData();
  renderTabs();
  renderApps();
  showToast("Gallery created", "success");
});

// ===========================
// App Rendering
// ===========================

function renderApps() {
  const gallery = galleries[currentGallery];
  if (!gallery || !gallery.apps || gallery.apps.length === 0) {
    appsGrid.style.display = "none";
    emptyState.style.display = "block";
    lucide.createIcons();
    return;
  }
  
  appsGrid.style.display = "grid";
  emptyState.style.display = "none";
  appsGrid.innerHTML = "";
  
  gallery.apps.forEach((app, index) => {
    const card = createAppCard(app, index);
    appsGrid.appendChild(card);
  });
  
  lucide.createIcons();
  initDragAndDrop();
}

function createAppCard(app, index) {
  const card = document.createElement("div");
  card.className = "app-card";
  card.draggable = true;
  card.dataset.index = index;
  
  if (!app.enabled) {
    card.classList.add("disabled");
  }
  
  card.innerHTML = `
    <div class="app-card-header">
      <div class="drag-handle">
        <i data-lucide="grip-vertical"></i>
      </div>
      <div class="app-card-actions">
        <div class="toggle-switch ${app.enabled ? 'active' : ''}" data-index="${index}">
          <div class="slider"></div>
        </div>
        <button class="icon-btn edit" data-index="${index}">
          <i data-lucide="edit"></i>
        </button>
        <button class="icon-btn delete" data-index="${index}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>
    
    <div class="app-icon-display" style="background: ${app.color}">
      <i data-lucide="${app.icon}"></i>
    </div>
    
    <h3>${app.title}</h3>
    <p>${app.description}</p>
    <div class="app-url">${app.url}</div>
    <a href="${app.url}" target="_blank" class="app-launch-btn">
      <i data-lucide="external-link"></i>
      <span>Launch App</span>
    </a>
  `;
  
  // Toggle handler
  const toggle = card.querySelector(".toggle-switch");
  toggle.addEventListener("click", () => toggleApp(index));
  
  // Edit handler
  const editBtn = card.querySelector(".edit");
  editBtn.addEventListener("click", () => openEditModal(index));
  
  // Delete handler
  const deleteBtn = card.querySelector(".delete");
  deleteBtn.addEventListener("click", () => deleteApp(index));
  
  return card;
}

// ===========================
// Add App Form
// ===========================

toggleAddFormBtn.addEventListener("click", () => {
  addAppForm.style.display = addAppForm.style.display === "none" ? "block" : "none";
  if (addAppForm.style.display === "block") {
    document.getElementById("app-title").focus();
  }
});

cancelAddFormBtn.addEventListener("click", () => {
  addAppForm.style.display = "none";
  newAppForm.reset();
});

// Color picker sync
const appColor = document.getElementById("app-color");
const appColorText = document.getElementById("app-color-text");

appColor.addEventListener("input", (e) => {
  appColorText.value = e.target.value;
});

appColorText.addEventListener("input", (e) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
    appColor.value = e.target.value;
  }
});

newAppForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const app = {
    title: document.getElementById("app-title").value,
    description: document.getElementById("app-description").value,
    url: document.getElementById("app-url").value,
    icon: document.getElementById("app-icon").value,
    color: document.getElementById("app-color").value,
    enabled: true
  };
  
  galleries[currentGallery].apps.push(app);
  saveData();
  renderApps();
  
  newAppForm.reset();
  addAppForm.style.display = "none";
  showToast("App added successfully", "success");
});

// ===========================
// Edit App
// ===========================

function openEditModal(index) {
  const app = galleries[currentGallery].apps[index];
  
  document.getElementById("edit-app-id").value = index;
  document.getElementById("edit-app-title").value = app.title;
  document.getElementById("edit-app-description").value = app.description;
  document.getElementById("edit-app-url").value = app.url;
  document.getElementById("edit-app-icon").value = app.icon;
  document.getElementById("edit-app-color").value = app.color;
  document.getElementById("edit-app-color-text").value = app.color;
  
  editModal.classList.add("show");
  lucide.createIcons();
}

function closeEditModal() {
  editModal.classList.remove("show");
  editAppForm.reset();
}

closeEditModalBtn.addEventListener("click", closeEditModal);
cancelEditModalBtn.addEventListener("click", closeEditModal);

// Color picker sync for edit form
const editAppColor = document.getElementById("edit-app-color");
const editAppColorText = document.getElementById("edit-app-color-text");

editAppColor.addEventListener("input", (e) => {
  editAppColorText.value = e.target.value;
});

editAppColorText.addEventListener("input", (e) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
    editAppColor.value = e.target.value;
  }
});

editAppForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const index = parseInt(document.getElementById("edit-app-id").value);
  
  galleries[currentGallery].apps[index] = {
    ...galleries[currentGallery].apps[index],
    title: document.getElementById("edit-app-title").value,
    description: document.getElementById("edit-app-description").value,
    url: document.getElementById("edit-app-url").value,
    icon: document.getElementById("edit-app-icon").value,
    color: document.getElementById("edit-app-color").value
  };
  
  saveData();
  renderApps();
  closeEditModal();
  showToast("App updated successfully", "success");
});

// Close modal on background click
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});

// ===========================
// App Actions
// ===========================

function toggleApp(index) {
  galleries[currentGallery].apps[index].enabled = !galleries[currentGallery].apps[index].enabled;
  saveData();
  renderApps();
  showToast(
    galleries[currentGallery].apps[index].enabled ? "App enabled" : "App disabled",
    "success"
  );
}

function deleteApp(index) {
  const app = galleries[currentGallery].apps[index];
  if (confirm(`Delete "${app.title}"?`)) {
    galleries[currentGallery].apps.splice(index, 1);
    saveData();
    renderApps();
    showToast("App deleted", "success");
  }
}

// ===========================
// Drag and Drop
// ===========================

let draggedIndex = null;

function initDragAndDrop() {
  const cards = appsGrid.querySelectorAll(".app-card");
  
  cards.forEach(card => {
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("drop", handleDrop);
    card.addEventListener("dragend", handleDragEnd);
  });
}

function handleDragStart(e) {
  draggedIndex = parseInt(this.dataset.index);
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  const dropIndex = parseInt(this.dataset.index);
  
  if (draggedIndex !== dropIndex) {
    const apps = galleries[currentGallery].apps;
    const draggedApp = apps[draggedIndex];
    
    apps.splice(draggedIndex, 1);
    apps.splice(dropIndex, 0, draggedApp);
    
    saveData();
    renderApps();
    showToast("App order updated", "success");
  }
  
  return false;
}

function handleDragEnd() {
  this.classList.remove("dragging");
  draggedIndex = null;
}

// ===========================
// Export / Import
// ===========================

exportBtn.addEventListener("click", () => {
  const dataStr = JSON.stringify(galleries, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `gallery-config-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showToast("Configuration exported", "success");
});

importBtn.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      
      if (confirm("Import configuration? This will replace all current data.")) {
        galleries = imported;
        currentGallery = Object.keys(galleries)[0];
        saveData();
        renderTabs();
        renderApps();
        showToast("Configuration imported successfully", "success");
      }
    } catch (error) {
      showToast("Invalid configuration file", "error");
      console.error("Import error:", error);
    }
  };
  reader.readAsText(file);
  
  // Reset file input
  importFile.value = "";
});

// ===========================
// Toast Notifications
// ===========================

function showToast(message, type = "success") {
  // Remove existing toast
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" ? "check-circle" : "alert-circle";
  
  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
