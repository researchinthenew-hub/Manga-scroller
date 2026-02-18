# 📜 MangaScroll Pro — Chrome Extension

A sleek, powerful auto-scroll extension built specifically for manga readers.
Works on **MangaDex**, **MangaFire**, **WeebCentral**, and every other manga platform.

---

## 🚀 HOW TO INSTALL LOCALLY (Developer Mode) — Step by Step

### Step 1 — Prepare the folder
Make sure your extension folder looks like this:
```
manga-scroller-extension/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── overlay.css
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Step 2 — Open Chrome Extensions page
- Open Google Chrome
- Type in the address bar: `chrome://extensions`
- Press Enter

### Step 3 — Enable Developer Mode
- Look at the **top-right corner** of the Extensions page
- Toggle the switch that says **"Developer mode"** → turn it ON
- You will see 3 new buttons appear: "Load unpacked", "Pack extension", "Update"

### Step 4 — Load the extension
- Click **"Load unpacked"**
- A file dialog will open — navigate to your `manga-scroller-extension` folder
- Select the **folder itself** (not any file inside it)
- Click **"Select Folder"** (or "Open" on Mac)

### Step 5 — Done!
- You'll see **MangaScroll Pro** appear in your extensions list
- The 📜 icon will appear in your Chrome toolbar
- If you don't see it, click the puzzle piece icon 🧩 in the toolbar and pin it

### Step 6 — Test it
- Open any manga on MangaDex, MangaFire, or WeebCentral
- Click the MangaScroll Pro icon in the toolbar
- Click **"▶ START SCROLLING"** or press `A` on the page

---

## 🎮 Features

| Feature | Description |
|---|---|
| Auto-scroll | Smooth continuous scrolling at adjustable speed |
| Speed control | Slider from 1–20 px/frame + 4 quick presets |
| Direction | Scroll DOWN or UP |
| Pause on hover | Stops when you hover the page (so you can read!) |
| Loop scroll | Jumps back to top when it reaches the bottom |
| Smooth mode | Sub-pixel accumulation for buttery slow speeds |
| Jump buttons | Instantly jump to top or bottom of the page |
| On-page HUD | Subtle status indicator shown on the manga page |

---

## ⌨️ Keyboard Shortcuts (press on the manga page)

| Key | Action |
|---|---|
| `A` | Toggle auto-scroll on/off |
| `SPACE` | Pause / Resume scrolling |
| `+` | Increase speed by 0.5 |
| `-` | Decrease speed by 0.5 |
| `D` | Flip scroll direction |
| `Home` | Jump to top of page |
| `End` | Jump to bottom of page |

---

## 🌐 Platform Support

The extension uses smart element detection to find the right scrollable container on each site:

- **MangaDex** (`mangadex.org`) — targets `.chapter-container`
- **MangaFire** (`mangafire.to`) — targets `#reader-container`
- **WeebCentral** (`weebcentral.com`) — targets `.chapter-images`
- **All other sites** — intelligently finds the best scrollable element automatically

---

## 🔧 Updating the Extension

After you make code changes:
1. Go to `chrome://extensions`
2. Find MangaScroll Pro
3. Click the **refresh icon ↻** on the extension card
4. Reload the manga page

---

## 📦 Publishing to Chrome Web Store (when ready)

1. Zip the entire `manga-scroller-extension` folder
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay the one-time $5 developer registration fee
4. Click "Add new item" and upload the zip
5. Fill in store listing details, screenshots, and submit for review
