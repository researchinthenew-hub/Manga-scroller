// ─── MangaScroll Pro — popup.js v3 ────────────────────────────────────────────

const $ = id => document.getElementById(id);

const defaults = {
  isScrolling:  false,
  speed:        5,
  direction:    'down',
  pauseOnHover: true,
  loopScroll:   false,
  smoothScroll: true,
  showHUD:      false      // ← NEW
};

let state = { ...defaults };

// ── Load saved state ──────────────────────────────────────────────────────────
chrome.storage.local.get(defaults, saved => {
  state = { ...defaults, ...saved };
  applyStateToUI();
  syncWithTab();
});

// ── UI Helpers ────────────────────────────────────────────────────────────────
function applyStateToUI() {
  $('autoScrollToggle').checked = state.isScrolling;
  $('speedSlider').value        = state.speed;
  $('speedDisplay').innerHTML   = `${state.speed} <span>px/frame</span>`;
  $('pauseOnHover').checked     = state.pauseOnHover;
  $('loopScroll').checked       = state.loopScroll;
  $('smoothScroll').checked     = state.smoothScroll;
  $('showHUD').checked          = state.showHUD;

  $('dirDown').classList.toggle('active', state.direction === 'down');
  $('dirUp').classList.toggle('active',   state.direction === 'up');

  updateMainBtn();
  updateStatus();
  refreshPresetHighlight();
  updateCheckboxVisuals();
}

function updateMainBtn() {
  const btn = $('mainBtn');
  if (state.isScrolling) {
    btn.textContent = '⏸ PAUSE SCROLLING';
    btn.classList.add('running');
  } else {
    btn.textContent = '▶ START SCROLLING';
    btn.classList.remove('running');
  }
}

function updateStatus() {
  const dot  = $('statusDot');
  const text = $('statusText');
  dot.className = 'dot';
  if (state.isScrolling) {
    dot.classList.add('active');
    text.textContent = 'SCROLLING';
  } else {
    text.textContent = 'IDLE';
  }
}

function refreshPresetHighlight() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.speed) === state.speed);
  });
}

function updateCheckboxVisuals() {
  ['pauseOnHover', 'loopScroll', 'smoothScroll', 'showHUD'].forEach(id => {
    const input  = $(id);
    if (!input) return;
    const visual = input.nextElementSibling;
    visual.textContent = input.checked ? '✓' : '';
  });
}

// ── Messaging ─────────────────────────────────────────────────────────────────
function sendToContent(action, data = {}, retried = false) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { action, ...data }, _res => {
      if (chrome.runtime.lastError && !retried) {
        chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] })
          .then(() => { setTimeout(() => sendToContent(action, data, true), 100); })
          .catch(() => {});
      }
    });
  });
}

function syncWithTab() {
  sendToContent('sync', {
    isScrolling:  state.isScrolling,
    speed:        state.speed,
    direction:    state.direction,
    pauseOnHover: state.pauseOnHover,
    loopScroll:   state.loopScroll,
    smoothScroll: state.smoothScroll,
    showHUD:      state.showHUD
  });
}

function saveAndSync() {
  chrome.storage.local.set(state);
  syncWithTab();
}

// ── Event Listeners ───────────────────────────────────────────────────────────

$('autoScrollToggle').addEventListener('change', function () {
  state.isScrolling = this.checked;
  updateMainBtn();
  updateStatus();
  saveAndSync();
});

$('mainBtn').addEventListener('click', () => {
  state.isScrolling = !state.isScrolling;
  $('autoScrollToggle').checked = state.isScrolling;
  updateMainBtn();
  updateStatus();
  saveAndSync();
});

$('speedSlider').addEventListener('input', function () {
  state.speed = parseInt(this.value, 10);
  $('speedDisplay').innerHTML = `${state.speed} <span>px/frame</span>`;
  refreshPresetHighlight();
  saveAndSync();
});

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    state.speed = parseInt(this.dataset.speed, 10);
    $('speedSlider').value = state.speed;
    $('speedDisplay').innerHTML = `${state.speed} <span>px/frame</span>`;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    saveAndSync();
  });
});

$('dirDown').addEventListener('click', () => {
  state.direction = 'down';
  $('dirDown').classList.add('active');
  $('dirUp').classList.remove('active');
  saveAndSync();
});
$('dirUp').addEventListener('click', () => {
  state.direction = 'up';
  $('dirUp').classList.add('active');
  $('dirDown').classList.remove('active');
  saveAndSync();
});

['pauseOnHover', 'loopScroll', 'smoothScroll', 'showHUD'].forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('change', function () {
    state[id] = this.checked;
    updateCheckboxVisuals();
    saveAndSync();
  });
});

$('scrollTopBtn').addEventListener('click',    () => sendToContent('scrollTo', { pos: 'top' }));
$('scrollBottomBtn').addEventListener('click', () => sendToContent('scrollTo', { pos: 'bottom' }));

chrome.runtime.onMessage.addListener(msg => {
  if (msg.action === 'statusUpdate') {
    state.isScrolling = msg.isScrolling;
    if (msg.speed !== undefined) state.speed = msg.speed;
    applyStateToUI();
  }
});
