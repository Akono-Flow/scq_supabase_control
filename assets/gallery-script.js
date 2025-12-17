// ===========================
// Gallery Page Script
// ===========================

const STORAGE_KEY = "galleryApps";

// This will be set by each gallery page
// e.g., const GALLERY_ID = "games";

function loadGallery() {
  const gallery = document.getElementById("gallery");
  
  // Show loading state
  gallery.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading apps...</p>
    </div>
  `;
  
  // Small delay for smooth loading experience
  setTimeout(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        showEmptyState("No configuration found. Please use the admin panel to add apps.");
        return;
      }
      
      const galleries = JSON.parse(stored);
      
      if (!galleries[GALLERY_ID]) {
        showEmptyState("Gallery not found. Please check the gallery ID.");
        return;
      }
      
      const galleryData = galleries[GALLERY_ID];
      
      if (!galleryData.apps || galleryData.apps.length === 0) {
        showEmptyState("No apps in this gallery yet. Use the admin panel to add apps.");
        return;
      }
      
      // Filter to only enabled apps
      const enabledApps = galleryData.apps.filter(app => app.enabled);
      
      if (enabledApps.length === 0) {
        showEmptyState("All apps are currently disabled. Check back soon!");
        return;
      }
      
      // Render apps
      gallery.innerHTML = "";
      enabledApps.forEach(app => {
        const card = createAppCard(app);
        gallery.appendChild(card);
      });
      
      // Initialize Lucide icons
      lucide.createIcons();
      
    } catch (error) {
      console.error("Error loading gallery:", error);
      showEmptyState("Error loading gallery. Please try refreshing the page.");
    }
  }, 300);
}

function createAppCard(app) {
  const card = document.createElement("div");
  card.className = "card";
  
  // Set CSS custom properties for colors
  card.style.setProperty("--card-color", app.color);
  card.style.setProperty("--card-color-light", lightenColor(app.color, 20));
  card.style.setProperty("--icon-color", app.color);
  
  card.innerHTML = `
    <div class="icon" style="background:${app.color}">
      <i data-lucide="${app.icon}"></i>
    </div>
    <h2>${escapeHtml(app.title)}</h2>
    <p>${escapeHtml(app.description)}</p>
    <a href="${escapeHtml(app.url)}" target="_blank" class="launch-btn">
      <span>Launch</span>
      <i data-lucide="external-link" style="width: 16px; height: 16px;"></i>
    </a>
  `;
  
  return card;
}

function showEmptyState(message) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = `
    <div class="empty-state">
      <i data-lucide="inbox"></i>
      <h3>No Apps Available</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  lucide.createIcons();
}

// Utility function to lighten a hex color
function lightenColor(hex, percent) {
  // Remove # if present
  hex = hex.replace("#", "");
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Lighten
  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
  
  // Convert back to hex
  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Load gallery when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadGallery();
});

// Reload gallery when localStorage changes (useful for testing)
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    loadGallery();
  }
});
