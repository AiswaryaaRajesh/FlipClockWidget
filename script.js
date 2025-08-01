// Widget Mode -----------------------------------------------------------------------------
function detectWidgetMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) {
    document.body.classList.add('widget-mode');
  }
}
detectWidgetMode();


// Update Clock ------------------------------------------------------------------------------
function createCardElement(digit) {
  return `
    <div class="bottom">${digit}</div>
    <div class="flip-bt">${digit}</div>
    <div class="flip-top">${digit}</div>
    <div class="flip-bottom">${digit}</div>
  `;
}

function setDigit(card, newDigit) {
  card.innerHTML = createCardElement(newDigit);
  card.setAttribute('data-digit', newDigit);
}

function updateDigit(selector, newDigit) {
  const card = document.querySelector(selector);
  const currentDigit = card.getAttribute('data-digit');

  if (currentDigit === newDigit) return;

  const flipBT = card.querySelector('.flip-bt');
  const flipTop = card.querySelector('.flip-top');
  const flipBottom = card.querySelector('.flip-bottom');

  // Show current digit pulling up
  flipBT.textContent = currentDigit;

  // Show next digit on flip-top and flip-bottom
  flipTop.textContent = newDigit;
  flipBottom.textContent = newDigit;

  card.classList.add('flipping');

  setTimeout(() => {
    setDigit(card, newDigit);
    card.classList.remove('flipping');
  }, 1000); // Match total animation time
}

function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');

  updateDigit('.hours-tens', h[0]);
  updateDigit('.hours-ones', h[1]);
  updateDigit('.minutes-tens', m[0]);
  updateDigit('.minutes-ones', m[1]);

  setTimeout(updateClock, 1000);
}

// Initialize digits
document.querySelectorAll('.flip-card').forEach(card => {
  const digit = card.getAttribute('data-digit') || '0';
  setDigit(card, digit);
});

// Start clock
updateClock();

// Automatically update footer year ----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script loaded!");

  const yearSpan = document.querySelector(".footer-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  } else {
    console.warn("⚠️ .footer-year not found");
  }
});


// Fullscreen Toggle ------------------------------------------------------------------------------
const fullscreenToggleIcon = document.getElementById("fullscreen-toggle");
const footer = document.querySelector("footer");

// Toggle fullscreen on icon click or double-click
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Update UI when fullscreen state changes
function updateFullscreenUI() {
  const isFullscreen = !!document.fullscreenElement;

  document.body.classList.toggle("hide-footer", isFullscreen);

  fullscreenToggleIcon.classList.toggle("fa-expand", !isFullscreen);
  fullscreenToggleIcon.classList.toggle("fa-compress", isFullscreen);
}

// Bind click and double-click
fullscreenToggleIcon.addEventListener("click", toggleFullscreen);
document.addEventListener("dblclick", toggleFullscreen);

// Handle Esc or any fullscreen exit
document.addEventListener("fullscreenchange", updateFullscreenUI);


// Digit Based Seconds WORKING-----------------------------------------------------------------------
function updateSecondsDigits() {
  const display = document.getElementById("secondsDisplay");
  const now = new Date();
  const seconds = now.getSeconds().toString().padStart(2, '0');
  display.textContent = seconds;
  display.style.opacity = 1;

  setTimeout(() => {
    display.style.opacity = 0;
  }, 800); // hides before next update
}

setInterval(updateSecondsDigits, 1000);


// THEME TOGGLE ------------------------------------------------------------------------------
const themeToggle = document.getElementById("toggle-seconds-dots");
const themeLabel = document.getElementById("toggle-seconds-label");

// Apply default dark theme on load
document.body.classList.add("dark-theme");
themeLabel.textContent = "Switch to Light Theme"; // since toggling switches to light

// Listen for theme toggle
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    themeLabel.textContent = "Switch to Dark Theme";
  } else {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    themeLabel.textContent = "Switch to Light Theme";
  }
});

// HEADER AND OVERLAYS-------------------------------------------------------------------------
const settingsIcon = document.querySelector('.settings-icon');
const settingsDropdown = document.getElementById('settings-dropdown');

// Utility to check if any overlay is open
function isOverlayOpen() {
  return !settingsDropdown.classList.contains('hidden');
}

// Open the settings overlay and lock header
function showOverlay() {
  closeOverlays();
  settingsDropdown.classList.remove('hidden');
  document.body.classList.add("overlay-open", "user-active");
  clearTimeout(userActiveTimeout); // prevent auto-hide
}

// Close overlay
function closeOverlays() {
  settingsDropdown.classList.add('hidden');
  document.body.classList.remove("overlay-open");

  // Restart the auto-hide timer for the header
  setTimeout(() => {
    setUserActive();
  }, 100); // slight delay ensures user sees header briefly after closing overlay
}


// Toggle on settings icon click
settingsIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  if (settingsDropdown.classList.contains('hidden')) {
    showOverlay();
  } else {
    closeOverlays();
  }
});

// Close overlay if clicked outside
document.addEventListener('click', (e) => {
  const clickedInsideSettings = settingsDropdown.contains(e.target) || settingsIcon.contains(e.target);
  if (!clickedInsideSettings) {
    closeOverlays();
  }
});

// Auto-show header on user activity (disabled if overlay is open)
let userActiveTimeout;
function setUserActive() {
  if (isOverlayOpen()) return; // prevent hiding when overlay is active
  document.body.classList.add("user-active");
  clearTimeout(userActiveTimeout);
  userActiveTimeout = setTimeout(() => {
    document.body.classList.remove("user-active");
  }, 5000);
}

// Detect user activity
["mousemove", "touchstart"].forEach(event =>
  document.addEventListener(event, setUserActive)
);

// Show header initially
setUserActive();

// DATE -----------------------------------------------------------------------------------------
function updateDate() {
  const dateElement = document.getElementById("dateDisplay");
  const now = new Date(); // Device's local time

  const day = String(now.getDate()).padStart(2, '0');
  const month = now.toLocaleString('default', { month: 'long' }); // Full month name
  const year = now.getFullYear();

  dateElement.textContent = `${day} ${month} ${year}`;
}

function scheduleMidnightUpdate() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const msUntilMidnight = nextMidnight - now;

  setTimeout(() => {
    updateDate();
    scheduleMidnightUpdate(); // Set again for the next day
  }, msUntilMidnight);
}

updateDate();             // Initial load
scheduleMidnightUpdate(); // Keep updating daily at midnight


// Exit hint -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const exitHint = document.getElementById("exit-hint");

  const userAgent = navigator.userAgent.toLowerCase();
  let hint = "Tap outside or swipe down to exit";

  if (userAgent.includes("android")) {
    hint = "Press back button to exit";
  } else if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("mac")) {
    hint = "Swipe up or tap outside to exit";
  } else if (userAgent.includes("windows") || userAgent.includes("linux")) {
    hint = "Press Esc or Space to exit";
  }

  exitHint.innerHTML = hint;
  exitHint.classList.add("show");

  setTimeout(() => {
    exitHint.classList.remove("show");
  }, 5000);
});

// Serviceworker -------------------------------------------------------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(reg => console.log("✅ Service Worker registered"))
    .catch(err => console.warn("❌ Service Worker failed", err));
}

// How to use Dialog Box ------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("pwa-guide-dialog");
  const dialogBody = document.getElementById("pwa-guide-instructions");
  const closeBtn = document.querySelector(".close-dialog");

  const ua = navigator.userAgent.toLowerCase();
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (!isPWA && dialog && dialogBody) {
    let content = "";

    if (ua.includes("android")) {
      content = `
        <p>To install this Flip Clock as an app:</p>
        <ol>
          <li>Tap the <strong>three dots ⋮</strong> at the top-right of your browser.</li>
          <li>Select <strong>"Add to Home screen"</strong>.</li>
          <li>Open it anytime as a fullscreen clock.</li>
        </ol>
      `;
    } else if (ua.includes("iphone") || ua.includes("ipad")) {
      content = `
        <p>To add this clock to your Home Screen:</p>
        <ol>
          <li>Tap the <strong>Share</strong> button (⤴️) at the bottom of Safari.</li>
          <li>Select <strong>"Add to Home Screen"</strong>.</li>
          <li>Open it from your Home Screen like a native app.</li>
        </ol>
      `;
    } else if (ua.includes("mac") || ua.includes("windows")) {
      content = `
        <p>To install this Flip Clock as a desktop PWA:</p>
        <ol>
          <li>Open this site in <strong>Chrome</strong> or <strong>Edge</strong>.</li>
          <li>Click the <strong>install icon</strong> (usually in the address bar).</li>
          <li>Or go to the menu (⋮ or ...) and select <strong>"Install App"</strong>.</li>
          <li>It will open in a dedicated fullscreen window like a widget.</li>
        </ol>
      `;
    } else {
      content = `
        <p>This Flip Clock can be installed as a PWA on most modern browsers:</p>
        <ol>
          <li>Look for the <strong>Install App</strong> icon in the browser's address bar or menu.</li>
          <li>Add it to your home screen or desktop for fullscreen use.</li>
        </ol>
      `;
    }

    dialogBody.innerHTML = content;
    dialog.classList.remove("hidden");

    closeBtn.addEventListener("click", () => {
      dialog.classList.add("hidden");
    });
  }
});
