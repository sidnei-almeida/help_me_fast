<img src="build/icons/128x128.png" width="64" height="64" alt="Help Me Fast" align="left" style="margin-right: 12px;" />

# Help Me Fast!

![Linux](https://img.shields.io/badge/Platform-Linux-1793D1?logo=linux) ![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

> **Prolonged fasting companion for Linux** — metabolic timer, progress tracking, and neuroscience-based pattern interruption. Data stays on your machine (BYOS).

I'm a fasting advocate and I work on my PC all day; my Android is broken, so I couldn't rely on a phone app. I built this for myself and for anyone who wants something like it — a simple, local-first fasting companion on the desktop.

A desktop application for Linux built for developers and power users on tiling window managers (e.g. Hyprland, Sway, i3) and standard desktop environments (GNOME, KDE, XFCE). You choose a “vault” folder; all config, profile, and history live there. No cloud, no account.

---

## Overview

Help Me Fast is not a simple countdown. It combines:

- **Metabolic-phase awareness** — A visual arc (SVG) that reflects biological phases (anabolic, catabolic, fat burning, ketosis) and a countdown to your goal.
- **Data-driven motivation** — Real-time estimates of fat burned and projected weight change from your profile (BMR/TDEE).
- **Pattern interruption** — A dedicated “I’m hungry” flow that prompts you to distinguish real hunger from boredom or habit before breaking a fast.
- **Local-first storage** — You choose a “vault” folder; all config, profile, and history live there as readable JSON. No cloud, no account.

The UI is a light, minimal desktop layout: sidebar navigation, frameless window with custom controls, and a central metabolic wheel. Supported on X11 and Wayland.

---

## 📸 Screenshots

<p align="center">
  <img src="Fasting.png" width="280" alt="Help Me Fast — Dashboard" />
  <img src="Fasting2.png" width="280" alt="Help Me Fast — Timer" />
  <img src="Fasting3.png" width="280" alt="Help Me Fast — History" />
</p>

---

## ✨ Features

- **Timer** — Countdown from your chosen fast length (presets and custom hours). Persists across restarts via absolute timestamps.
- **Metabolic wheel** — Single continuous gradient (gold to orange) that “empties” as time elapses; phase ticks and optional profile avatar as progress indicator; hover tooltips with phase descriptions and electrolyte tips.
- **Dashboard** — While fasting: fat burned, projected weight loss, current phase badge. Rotating tips (electrolytes, Snake Juice, hydration, safety) from a built-in tip set. When idle: duration tiles (intermittent and prolonged), custom hours, and “Start Fast”.
- **Pattern-interruption modal** — “I’m hungry” opens a modal: “Real hunger or boredom/habit?” to encourage a deliberate choice before ending the fast.
- **Profile** — Name, avatar (stored in vault), weight, height, age, gender, activity level. BMR/TDEE used for projections. Profile screen allows editing and re-uploading avatar; optional “Disconnect vault” resets app state and prompts for a new vault on next launch.
- **History** — Progress entries (date, optional weight, optional photo, notes). Weight chart (Recharts). Initial entry is created from profile weight when none exist. Add/delete entries via modal.
- **Vault** — First run: pick folder, set name/avatar, then complete profile. Last vault path is stored in app config for auto-load on next start. All data: `config.json`, `profile.json`, `history.json`, `active-fast.json`, `avatar.png`, `photos/` for history images.

---

## 🛠️ Tech Stack

| Layer        | Choice                |
|-------------|------------------------|
| Runtime     | Electron 28            |
| Build       | Vite 5, esbuild (main/preload) |
| Language    | TypeScript (strict)    |
| UI          | React 18 (functional components, hooks) |
| Styling     | styled-components 6    |
| State       | React Context + useReducer (single store) |
| Charts      | Recharts              |
| Icons       | lucide-react          |
| Persistence | Node `fs` via Electron IPC; no backend |

---

## 📁 Data and Vault (BYOS)

You choose a directory as the “vault”. The app creates and maintains:

| File / path   | Purpose |
|---------------|--------|
| `config.json` | Theme, notifications, danger zones, weight unit (kg/lbs). |
| `profile.json` | Name, avatar path, weight, height, age, gender, activity level, TMB. |
| `history.json` | `fasts[]`, `progressEntries[]` (id, date, weight?, photoPath?, notes?). |
| `active-fast.json` | Current run: `isActive`, `startTime`, `targetHours` (persists across restarts). |
| `avatar.png`  | Profile picture (saved from setup or profile screen). |
| `photos/`     | Images attached to history entries. |

Global app settings (e.g. last used vault path) live in Electron’s `userData`, not inside the vault. All vault files are human-readable JSON (and PNG) so you can back up or migrate the folder yourself.

---

## 📌 Requirements

- **Node.js** 18+ (20 LTS recommended)
- **npm** (or compatible package manager)
- **Linux** (primary target; Wayland and X11 supported)
- For running the built app: GTK3, libnotify, NSS, libxss, libsecret, etc. (see `install.sh` for distro-specific lists)
- **Git LFS** — required to download the pre-built AppImage and release binaries from the repo (see below).

---

## 📦 Installation

### Cloning the repository (Git LFS)

This repo uses [Git LFS](https://git-lfs.com/) for large files: the AppImage and the Linux unpacked binary in `release/`. Without LFS you get small pointer files instead of the real binaries, and the installer won’t have a working AppImage.

**One-time setup (if you don’t have Git LFS yet):**

```bash
# Install Git LFS (e.g. on Arch/CachyOS)
sudo pacman -S git-lfs
git lfs install
```

**Clone and pull large files:**

```bash
git clone https://github.com/sidnei-almeida/help_me_fast.git
cd help_me_fast
git lfs pull
```

After `git lfs pull`, `release/Help Me Faast-*.AppImage` and `release/linux-unpacked/help-me-faast` will be the real files. You can then run `./install.sh` (option 3 or 1) to create the desktop entry and install icons.

---

### From source (development)

```bash
git clone https://github.com/sidnei-almeida/help_me_fast.git
cd help_me_fast
git lfs pull    # optional if you only want to run in dev mode
npm install
npm run electron:dev
```

### Linux: one-shot installer (recommended)

The repository includes an installer script that detects distro (Arch, Debian/Ubuntu, Fedora/RHEL, openSUSE, Void), installs system and Node dependencies, builds the app, and optionally builds a package (AppImage, deb, rpm, or pacman) and creates a desktop entry with icons.

**If you cloned the repo:** make sure you ran `git lfs pull` so the AppImage in `release/` is the real file. Then:

```bash
chmod +x install.sh
./install.sh
```

Follow the menu to install dependencies, build the app, and optionally build the distributable and create the launcher entry. Icons are installed under `~/.local/share/icons/hicolor` and the desktop file as `help-me-fast.desktop` in `~/.local/share/applications`.

---

## 🧑‍💻 Development

```bash
npm run electron:dev
```

This builds the Electron main and preload scripts, starts the Vite dev server (port 5173), and launches Electron with the app loaded from the dev server. DevTools are attached in development only.

- **Frontend only:** `npm run dev` (Vite).
- **Electron only (no Vite):** build once with `npm run build:electron` then run `electron .` (serves built static assets).

---

## 🏗️ Building for production

```bash
npm run electron:build
```

Builds the Vite app and Electron in production mode, then runs `electron-builder` for Linux (default: AppImage + deb + rpm + pacman). Artifacts go to `release/`.

Targets:

- `npm run electron:build:appimage` — AppImage only  
- `npm run electron:build:deb` — .deb  
- `npm run electron:build:rpm` — .rpm  
- `npm run electron:build:pacman` — pacman (Arch)

Build uses `build/icons/` for the app icon (multiple PNG sizes). `productName` is “Help Me Fast”.

---

## 📂 Project structure

```
help_me_fast/
├── electron/
│   ├── main.ts          # Main process: window, IPC (vault, history, settings, dialogs, window controls)
│   └── preload.ts       # contextBridge API for renderer
├── src/
│   ├── App.tsx          # Shell: sidebar, drag region, window controls, view routing, loading splash
│   ├── main.tsx
│   ├── index.css
│   ├── assets/          # Logo and static assets
│   ├── components/
│   │   ├── Dashboard/   # Timer view: MetabolicArc, stats, tips, duration selector or “End Fast”
│   │   ├── FastTypeSelector/  # Duration tiles + custom hours
│   │   ├── HistoryScreen/     # Progress chart, timeline, AddEntryModal
│   │   ├── MetabolicArc/     # SVG wheel, gradient, mask, phase ticks, tooltips, avatar knob
│   │   ├── PanicButton/      # “I’m hungry” + pattern-interruption modal
│   │   ├── ProfileSetup/     # Profile form, avatar upload, danger zone (disconnect vault)
│   │   ├── Sidebar/          # Nav (Timer / History / Profile), profile card, vault badge
│   │   ├── VaultSetup/       # First-run: folder picker, name, avatar, then profile step
│   │   └── WindowControls/   # Minimize, maximize, close (frameless)
│   ├── context/
│   │   └── AppContext.tsx    # Global state (vault, profile, config, history, currentFast, activeView)
│   ├── data/
│   │   └── fastingTips.ts   # Categorized tips (electrolytes, hydration, etc.) and rotation logic
│   ├── hooks/
│   │   ├── useFastingTimer.ts   # Countdown, start/end fast, persist active-fast.json
│   │   ├── useMetabolicMotivation.ts  # BMR/TDEE, fat burned, projected weight, phase message
│   │   └── useVault.ts       # load/save config, profile, history, active-fast; init; deleteVault
│   ├── styles/
│   │   └── theme.ts
│   ├── types/
│   │   ├── index.ts         # Config, Profile, History, ProgressEntry, AppState, etc.
│   │   └── electron.d.ts     # Window.electronAPI typings
│   └── utils/
│       ├── calculateTMB.ts
│       ├── weightConverter.ts
│       ├── metabolicPhases.ts
│       ├── activityMultipliers.ts
│       └── fastTypes.ts
├── build/
│   └── icons/           # PNG icons for electron-builder and install.sh
├── build-electron.js    # esbuild config for main + preload
├── install.sh           # Linux installer and desktop entry
├── uninstall.sh         # Remove menu entry and icons (for re-testing install)
├── package.json
└── vite.config.ts
```

---

## 👤 Author

**Sidnei Almeida**

- GitHub: [@sidnei-almeida](https://github.com/sidnei-almeida)
- LinkedIn: [Sidnei Almeida](https://www.linkedin.com/in/saaelmeida93/)

---

## 📄 License

MIT.
