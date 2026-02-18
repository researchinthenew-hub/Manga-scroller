// ─── MangaScroll Pro — content.js v5 ──────────────────────────────────────────
// v5 changes:
//  • ALL keyboard shortcuts REMOVED completely
//  • HUD pill is physically removed from DOM when hidden (not just display:none)
//  • showHUD always forced to false on init — clears any old cached storage value
//  • Only the popup controls the extension — no page-level key handling at all

(function () {
  // Destroy any previous instance (SPA navigation safety)
  if (window.__mangaScrollInstance) {
    window.__mangaScrollInstance.destroy();
  }
  const instance = {};
  window.__mangaScrollInstance = instance;

  // ── State ──────────────────────────────────────────────────────────────────
  let cfg = {
    isScrolling:  false,
    speed:        5,
    direction:    'down',
    pauseOnHover: true,
    loopScroll:   false,
    smoothScroll: true,
    showHUD:      false   // always starts hidden — popup is the only way to show it
  };

  let rafId           = null;
  let isPausedByHover = false;
  let accumulator     = 0;
  let destroyed       = false;

  // ── Scroll helpers ─────────────────────────────────────────────────────────
  function doScroll(amount) {
    const beforeY = window.scrollY;
    window.scrollBy(0, amount);
    if (Math.abs(window.scrollY - beforeY) >= 0.5) return; // window moved ✓
    const el = findScrollableElement();
    if (el) {
      el.scrollTop += amount;
    } else {
      document.documentElement.scrollTop += amount;
      document.body.scrollTop += amount;
    }
  }

  function getTotalScrollTop() {
    if (window.scrollY > 0) return window.scrollY;
    const el = findScrollableElement();
    return el ? el.scrollTop : document.documentElement.scrollTop;
  }
  function getTotalScrollHeight() {
    const el = findScrollableElement();
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      el ? el.scrollHeight : 0
    );
  }
  function getTotalClientHeight() {
    return window.innerHeight || document.documentElement.clientHeight;
  }

  // ── Scroll target finder ────────────────────────────────────────────────────
  let _cachedEl = null, _cacheStamp = 0;

  function findScrollableElement() {
    if (_cachedEl && Date.now() - _cacheStamp < 3000) return _cachedEl;
    const host = location.hostname.replace(/^www\./, '');

    const siteSelectors = [];
    if (host.includes('mangadex.org')) {
      siteSelectors.push('.chapter-container','[class*="chapter-container"]','.reading-page','[class*="reader-area"]','.ps');
    } else if (host.includes('mangafire')) {
      siteSelectors.push('#reader-container','.reader-container','[class*="reader"]','#main-wrapper','.chapter-container');
    } else if (host.includes('weebcentral')) {
      siteSelectors.push('.chapter-images','[class*="chapter-image"]','.reader-area','#content');
    } else if (host.includes('mangaplaza')) {
      siteSelectors.push('.viewer-container','[class*="viewer"]','.comic-page','#comic-wrapper','[class*="reader"]');
    }

    const genericSelectors = [
      '#reader-container','#reader','#manga-reader',
      '.reader-container','.reader','.manga-reader',
      '.chapter-reader','.chapter-container','.chapter-images',
      '.reading-content','.reading-container',
      '.pages-container','.page-container',
      '.viewer-container','.viewer',
      '#main-content','.main-content','main'
    ];

    for (const sel of [...siteSelectors, ...genericSelectors]) {
      try {
        const el = document.querySelector(sel);
        if (el && isActuallyScrollable(el)) return setCache(el);
      } catch (_) {}
    }
    return setCache(detectImageContainer());
  }

  function isActuallyScrollable(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const ov = style.overflow + style.overflowY;
    return (ov.includes('auto') || ov.includes('scroll')) && el.scrollHeight > el.clientHeight + 50;
  }

  function detectImageContainer() {
    let best = null, bestScore = 0;
    document.querySelectorAll('div, section, article').forEach(el => {
      const imgs  = el.querySelectorAll('img').length;
      const ratio = el.scrollHeight / (window.innerHeight || 1);
      if (imgs > 1 && ratio > 1.5) {
        const score = imgs * ratio * (isActuallyScrollable(el) ? 4 : 1);
        if (score > bestScore) { bestScore = score; best = el; }
      }
    });
    return best;
  }

  function setCache(el) { _cachedEl = el; _cacheStamp = Date.now(); return el; }

  // ── Core animation loop ────────────────────────────────────────────────────
  function scrollLoop() {
    if (destroyed) return;
    if (!cfg.isScrolling || isPausedByHover) {
      rafId = requestAnimationFrame(scrollLoop);
      return;
    }
    const dir = cfg.direction === 'down' ? 1 : -1;
    if (cfg.smoothScroll) {
      accumulator += cfg.speed * dir;
      const px = Math.trunc(accumulator);
      if (Math.abs(px) >= 1) { doScroll(px); accumulator -= px; }
    } else {
      doScroll(cfg.speed * dir);
    }
    if (cfg.loopScroll) {
      const st = getTotalScrollTop(), sh = getTotalScrollHeight(), ch = getTotalClientHeight();
      if (cfg.direction === 'down' && st + ch >= sh - 10) jumpTo('top');
      if (cfg.direction === 'up'   && st <= 10)           jumpTo('bottom');
    }
    rafId = requestAnimationFrame(scrollLoop);
  }

  function startLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    accumulator = 0;
    rafId = requestAnimationFrame(scrollLoop);
  }
  function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // ── Jump top / bottom ──────────────────────────────────────────────────────
  function jumpTo(pos) {
    if (pos === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const el = findScrollableElement();
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        const e2 = findScrollableElement();
        if (e2) e2.scrollTop = 0;
      }, 400);
    } else {
      window.scrollTo({ top: getTotalScrollHeight(), behavior: 'smooth' });
      const el = findScrollableElement();
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }

  // ── Hover pause ────────────────────────────────────────────────────────────
  function onMouseEnter() { if (cfg.pauseOnHover) isPausedByHover = true; }
  function onMouseLeave() { isPausedByHover = false; }
  document.body.addEventListener('mouseenter', onMouseEnter);
  document.body.addEventListener('mouseleave', onMouseLeave);

  // ── Message listener (popup → content) ────────────────────────────────────
  function onMessage(msg, _sender, sendResponse) {
    switch (msg.action) {
      case 'sync':
        cfg = {
          isScrolling:  msg.isScrolling,
          speed:        msg.speed,
          direction:    msg.direction,
          pauseOnHover: msg.pauseOnHover,
          loopScroll:   msg.loopScroll,
          smoothScroll: msg.smoothScroll,
          showHUD:      typeof msg.showHUD === 'boolean' ? msg.showHUD : false
        };
        _cachedEl = null;
        if (cfg.isScrolling) startLoop(); else stopLoop();
        syncHUD();
        sendResponse({ ok: true });
        break;

      case 'scrollTo':
        jumpTo(msg.pos);
        sendResponse({ ok: true });
        break;
    }
    return true;
  }
  chrome.runtime.onMessage.addListener(onMessage);

  // ── HUD overlay ────────────────────────────────────────────────────────────
  // The pill element is only added to the DOM when showHUD is true,
  // and physically REMOVED when showHUD becomes false.
  // This way old storage values can never make it visible unintentionally.

  function syncHUD() {
    if (cfg.showHUD) {
      ensurePill();
      refreshPill();
    } else {
      removePill();
    }
  }

  function ensurePill() {
    if (document.getElementById('__ms_pill')) return;
    // Make sure the outer wrapper exists
    let hud = document.getElementById('__ms_hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = '__ms_hud';
      document.body.appendChild(hud);
    }
    const pill = document.createElement('div');
    pill.id = '__ms_pill';
    pill.innerHTML = `<span id="__ms_dot">●</span><span id="__ms_label">MANGASCROLL</span>`;
    hud.appendChild(pill);
  }

  function removePill() {
    const pill = document.getElementById('__ms_pill');
    if (pill) pill.remove();
  }

  function refreshPill() {
    const dot   = document.getElementById('__ms_dot');
    const label = document.getElementById('__ms_label');
    if (!dot) return;
    dot.style.color   = cfg.isScrolling ? '#39d98a' : '#666680';
    label.textContent = cfg.isScrolling
      ? `AUTO ${cfg.direction === 'down' ? '▼' : '▲'} ${cfg.speed}`
      : 'MANGASCROLL';
  }

  // ── Destroy ────────────────────────────────────────────────────────────────
  instance.destroy = function () {
    destroyed = true;
    stopLoop();
    document.body.removeEventListener('mouseenter', onMouseEnter);
    document.body.removeEventListener('mouseleave', onMouseLeave);
    chrome.runtime.onMessage.removeListener(onMessage);
    const hud = document.getElementById('__ms_hud');
    if (hud) hud.remove();
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  // Force showHUD: false on every page load — ignore any old stored value.
  // Only the popup's sync message can enable the HUD after load.
  chrome.storage.local.get({
    isScrolling: false, speed: 5, direction: 'down',
    pauseOnHover: true, loopScroll: false, smoothScroll: true
  }, saved => {
    cfg = {
      ...cfg,
      isScrolling:  saved.isScrolling  || false,
      speed:        saved.speed        || 5,
      direction:    saved.direction    || 'down',
      pauseOnHover: saved.pauseOnHover !== undefined ? saved.pauseOnHover : true,
      loopScroll:   saved.loopScroll   || false,
      smoothScroll: saved.smoothScroll !== undefined ? saved.smoothScroll : true,
      showHUD:      false   // ALWAYS start hidden — popup sync will apply real value
    };
    if (cfg.isScrolling) startLoop();
    // Do NOT create any HUD element here — wait for popup sync
  });

})();
