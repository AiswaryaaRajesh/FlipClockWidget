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

// FULLSCREEN TOGGLE --------------------------------------------------------
const fullscreenToggleIcon = document.getElementById("fullscreen-toggle");
const footer = document.querySelector("footer");

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function updateFullscreenUI() {
  const isFullscreen = !!document.fullscreenElement;

  // Footer should always be hidden in fullscreen
  document.body.classList.toggle("hide-footer", isFullscreen);

  fullscreenToggleIcon.classList.toggle("fa-expand", !isFullscreen);
  fullscreenToggleIcon.classList.toggle("fa-compress", isFullscreen);
}

fullscreenToggleIcon.addEventListener("click", toggleFullscreen);
document.addEventListener("dblclick", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  updateFullscreenUI();
  setUserActive(); // restart auto-hide with updated fullscreen state
});

// HEADER AND OVERLAYS -------------------------------------------------------
const settingsIcon = document.querySelector('.settings-icon');
const settingsDropdown = document.getElementById('settings-dropdown');

function isOverlayOpen() {
  return !settingsDropdown.classList.contains('hidden');
}

function showOverlay() {
  closeOverlays();
  settingsDropdown.classList.remove('hidden');
  document.body.classList.add("overlay-open", "user-active");
  clearTimeout(userActiveTimeout);
}

function closeOverlays() {
  settingsDropdown.classList.add('hidden');
  document.body.classList.remove("overlay-open");

  setTimeout(() => {
    setUserActive(); // restart hide timer
  }, 100);
}

settingsIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  if (settingsDropdown.classList.contains('hidden')) {
    showOverlay();
  } else {
    closeOverlays();
  }
});

document.addEventListener('click', (e) => {
  const clickedInsideSettings = settingsDropdown.contains(e.target) || settingsIcon.contains(e.target);
  if (!clickedInsideSettings) {
    closeOverlays();
  }
});

// AUTO HIDE HEADER + FOOTER LOGIC ------------------------------------------
let userActiveTimeout;

function setUserActive() {
  const isFullscreen = !!document.fullscreenElement;
  const overlayOpen = isOverlayOpen();

  document.body.classList.add("user-active"); // show header (footer controlled separately)

  clearTimeout(userActiveTimeout);
  userActiveTimeout = setTimeout(() => {
    // Always keep header visible if overlay is open
    if (!overlayOpen) {
      document.body.classList.remove("user-active"); // hides header

      // hide footer only in non-fullscreen mode (in fullscreen it's already hidden)
      if (!isFullscreen) {
        document.body.classList.remove("hide-footer");
      }
    }
  }, 5000);
}

["mousemove", "touchstart"].forEach(event =>
  document.addEventListener(event, setUserActive)
);

// INITIAL SETUP -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  setUserActive();
  updateFullscreenUI();
});


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


// Detect if running as a PWA
function detectPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer?.startsWith('android-app://');
}

// Show install guide
function showInstallDialog() {
  const dialog = document.getElementById("pwa-guide-dialog");
  const dialogBody = document.getElementById("pwa-guide-instructions");
  const closeBtn = dialog?.querySelector(".close-dialog");

  if (!dialog || !dialogBody) return;

  const ua = navigator.userAgent.toLowerCase();
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
      </ol>
    `;
  } else {
    content = `
      <p>This Flip Clock can be installed as a PWA on most modern browsers:</p>
      <ol>
        <li>Look for the <strong>Install App</strong> icon in the browser's address bar or menu (⋮ or ...).</li>
        <li>Add it to your home screen or desktop for fullscreen use.</li>
      </ol>
    `;
  }

  dialogBody.innerHTML = content;
  dialog.classList.remove("hidden");
  closeBtn?.addEventListener("click", () => dialog.classList.add("hidden"));
}

// Show screen timeout instructions
function showScreenLockDialog() {
  const lockDialog = document.getElementById("screen-lock-dialog");
  const lockBody = document.getElementById("screen-lock-instructions");
  const closeBtns = lockDialog?.querySelectorAll(".close-dialog");

  if (!lockDialog || !lockBody) return;

  const ua = navigator.userAgent.toLowerCase();
  let lockContent = "";

  if (ua.includes("iphone") || ua.includes("ipad")) {
    lockContent = `
      <ol>
        <li>Go to <strong>Settings → Display & Brightness → Auto-Lock</strong>.</li>
        <li>Set it to <strong>Never</strong>.</li>
      </ol>
    `;
  } else if (ua.includes("android")) {
    lockContent = `
      <ol>
        <li>Go to <strong>Settings → Display</strong> or <strong>Display & Brightness</strong>.</li>
        <li>Find <strong>Sleep</strong> or <strong>Screen Timeout</strong> and set it to <strong>30 minutes</strong> or <strong>Never</strong>.</li>
      </ol>
    `;
  } else if (ua.includes("mac") || ua.includes("windows")) {
    lockContent = `
      <ol>
        <li>Go to <strong>Settings → Power & Sleep</strong>.</li>
        <li>Under <strong>Screen</strong>, set "Turn off after" to <strong>Never</strong>.</li>
      </ol>
    `;
  }

  lockBody.innerHTML = lockContent;
  lockDialog.classList.remove("hidden");

  closeBtns.forEach(btn =>
    btn.addEventListener("click", () => lockDialog.classList.add("hidden"))
  );
}

// Wake Lock API
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('✅ Wake Lock activated');

      document.addEventListener('visibilitychange', async () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
          try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('🔄 Wake Lock re-acquired');
          } catch (err) {
            console.error('⚠️ Failed to re-acquire Wake Lock:', err);
          }
        }
      });
    } else {
      console.warn('❌ Wake Lock API not supported on this device.');
    }
  } catch (err) {
    console.error('❌ Wake Lock request failed:', err);
  }
}

// Service Worker + Update Banner
function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  let newWorker;
  const banner = document.getElementById('update-banner');
  const updatedBanner = document.getElementById('updated-banner');
  const refreshBtn = document.getElementById('refresh-btn');

  navigator.serviceWorker.register('./service-worker.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          banner?.classList.remove('hidden');
        }
      });
    });
  });

  refreshBtn?.addEventListener('click', () => {
    newWorker?.postMessage({ action: 'skipWaiting' });
    sessionStorage.setItem('versionUpdated', 'true');
    window.location.reload();
  });

  window.addEventListener('load', () => {
    if (sessionStorage.getItem('versionUpdated')) {
      sessionStorage.removeItem('versionUpdated');
      updatedBanner?.classList.remove('hidden');
      setTimeout(() => {
        updatedBanner?.classList.add('hidden');
      }, 3000);
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// Entry point
window.addEventListener("load", () => {
  setupServiceWorker();

  // Slight delay to let `display-mode` stabilize
  setTimeout(() => {
    const isPWA = detectPWA();

    if (isPWA) {
      showScreenLockDialog();
      requestWakeLock();
    } else {
      showInstallDialog();
    }
  }, 200);
});
