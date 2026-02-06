#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# Help Me Fast! — Linux Installer
# Supports: Arch/Manjaro, Ubuntu/Debian, Fedora/RHEL, openSUSE
# Desktop Environments: GNOME, KDE Plasma, Hyprland, Sway, i3, XFCE, etc.
# Display Servers: Wayland + X11
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Colors ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; }
header()  { echo -e "\n${BOLD}${CYAN}═══ $* ═══${NC}\n"; }

# ─── Distro Detection ─────────────────────────────────────────────────
detect_distro() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO_ID="${ID:-unknown}"
    DISTRO_NAME="${PRETTY_NAME:-$ID}"
    DISTRO_FAMILY="${ID_LIKE:-$ID}"
  elif command -v lsb_release &>/dev/null; then
    DISTRO_ID=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
    DISTRO_NAME=$(lsb_release -sd)
    DISTRO_FAMILY="$DISTRO_ID"
  else
    DISTRO_ID="unknown"
    DISTRO_NAME="Unknown Linux"
    DISTRO_FAMILY="unknown"
  fi

  # Normalize family
  case "$DISTRO_FAMILY" in
    *arch*)   PKG_MANAGER="pacman" ;;
    *debian*|*ubuntu*) PKG_MANAGER="apt" ;;
    *fedora*|*rhel*|*centos*) PKG_MANAGER="dnf" ;;
    *suse*)   PKG_MANAGER="zypper" ;;
    *)
      case "$DISTRO_ID" in
        arch|manjaro|endeavouros|cachyos|garuda|artix) PKG_MANAGER="pacman" ;;
        ubuntu|debian|linuxmint|pop|elementary|zorin)  PKG_MANAGER="apt" ;;
        fedora|rhel|centos|rocky|alma|nobara)          PKG_MANAGER="dnf" ;;
        opensuse*|sles)                                 PKG_MANAGER="zypper" ;;
        void)                                           PKG_MANAGER="xbps" ;;
        *)                                              PKG_MANAGER="unknown" ;;
      esac
    ;;
  esac
}

# ─── Display Environment Detection ────────────────────────────────────
detect_display() {
  if [ -n "${WAYLAND_DISPLAY:-}" ] || [ "${XDG_SESSION_TYPE:-}" = "wayland" ]; then
    DISPLAY_SERVER="wayland"
  else
    DISPLAY_SERVER="x11"
  fi

  DE="${XDG_CURRENT_DESKTOP:-unknown}"
  SESSION="${XDG_SESSION_DESKTOP:-$DE}"
}

# ─── Install System Dependencies ──────────────────────────────────────
install_system_deps() {
  header "Installing System Dependencies"

  # Common deps needed by Electron on Linux
  local DEPS_GENERIC=(
    "git"
    "curl"
    "wget"
  )

  case "$PKG_MANAGER" in
    pacman)
      info "Detected: Arch-based ($DISTRO_NAME)"
      info "Installing with pacman..."
      sudo pacman -Syu --noconfirm --needed \
        "${DEPS_GENERIC[@]}" \
        nodejs npm \
        nss libxss alsa-lib \
        gtk3 libnotify \
        libappindicator-gtk3 \
        xdg-utils \
        libsecret \
        at-spi2-core \
        mesa \
        2>/dev/null || true
      ;;

    apt)
      info "Detected: Debian/Ubuntu-based ($DISTRO_NAME)"
      info "Installing with apt..."
      sudo apt-get update -qq
      sudo apt-get install -y -qq \
        "${DEPS_GENERIC[@]}" \
        nodejs npm \
        libgtk-3-0 libnotify4 libnss3 \
        libxss1 libxtst6 \
        xdg-utils \
        libatspi2.0-0 \
        libuuid1 \
        libsecret-1-0 \
        libgbm1 \
        libasound2 \
        2>/dev/null || true
      ;;

    dnf)
      info "Detected: Fedora/RHEL-based ($DISTRO_NAME)"
      info "Installing with dnf..."
      sudo dnf install -y \
        "${DEPS_GENERIC[@]}" \
        nodejs npm \
        gtk3 libnotify nss \
        libXScrnSaver libXtst \
        xdg-utils \
        at-spi2-core \
        libsecret \
        alsa-lib \
        mesa-libGL \
        2>/dev/null || true
      ;;

    zypper)
      info "Detected: openSUSE ($DISTRO_NAME)"
      info "Installing with zypper..."
      sudo zypper install -y \
        "${DEPS_GENERIC[@]}" \
        nodejs npm \
        gtk3 libnotify4 \
        mozilla-nss \
        libXScrnSaver1 libXtst6 \
        xdg-utils \
        at-spi2-core \
        libsecret-1-0 \
        alsa \
        Mesa-libGL1 \
        2>/dev/null || true
      ;;

    xbps)
      info "Detected: Void Linux ($DISTRO_NAME)"
      info "Installing with xbps..."
      sudo xbps-install -Sy \
        "${DEPS_GENERIC[@]}" \
        nodejs \
        gtk+3 libnotify nss \
        libXScrnSaver libXtst \
        xdg-utils \
        at-spi2-core \
        libsecret \
        alsa-lib \
        2>/dev/null || true
      ;;

    *)
      warn "Unknown package manager for $DISTRO_NAME"
      warn "Please install these manually: git, curl, nodejs (v18+), npm"
      warn "And these Electron deps: gtk3, libnotify, nss, libxss, alsa-lib, libsecret"
      ;;
  esac

  success "System dependencies installed"
}

# ─── Check/Install Node.js ────────────────────────────────────────────
check_node() {
  header "Checking Node.js"

  if command -v node &>/dev/null; then
    local NODE_VER
    NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    info "Found Node.js $(node -v)"

    if [ "$NODE_VER" -lt 18 ]; then
      warn "Node.js v18+ required. You have $(node -v)."
      warn "Consider upgrading via nvm: https://github.com/nvm-sh/nvm"

      read -rp "$(echo -e "${YELLOW}Install Node.js v20 via nvm? [y/N]:${NC} ")" INSTALL_NVM
      if [[ "$INSTALL_NVM" =~ ^[Yy]$ ]]; then
        install_nvm_node
      else
        error "Node.js v18+ is required. Aborting."
        exit 1
      fi
    else
      success "Node.js $(node -v) is compatible"
    fi
  else
    warn "Node.js not found."
    read -rp "$(echo -e "${YELLOW}Install Node.js v20 via nvm? [Y/n]:${NC} ")" INSTALL_NVM
    if [[ ! "$INSTALL_NVM" =~ ^[Nn]$ ]]; then
      install_nvm_node
    else
      error "Node.js is required. Aborting."
      exit 1
    fi
  fi
}

install_nvm_node() {
  info "Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

  # Source nvm for current session
  export NVM_DIR="${HOME}/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  info "Installing Node.js v20 (LTS)..."
  nvm install 20
  nvm use 20
  nvm alias default 20

  success "Node.js $(node -v) installed via nvm"
}

# ─── Install npm Dependencies ─────────────────────────────────────────
install_npm_deps() {
  header "Installing npm Dependencies"

  if [ ! -f "package.json" ]; then
    error "package.json not found. Are you in the project root?"
    exit 1
  fi

  info "Running npm install..."
  npm install

  success "npm dependencies installed"
}

# ─── Build the Application ────────────────────────────────────────────
build_app() {
  header "Building Help Me Fast!"

  info "Building React frontend (Vite)..."
  npm run build

  info "Building Electron main process..."
  NODE_ENV=production npm run build:electron

  success "Application built successfully"
}

# ─── Build Distributable Package ──────────────────────────────────────
build_package() {
  header "Building Distributable Package"

  local TARGET=""

  case "$PKG_MANAGER" in
    pacman)  TARGET="pacman" ;;
    apt)     TARGET="deb" ;;
    dnf)     TARGET="rpm" ;;
    *)       TARGET="AppImage" ;;
  esac

  info "Building $TARGET package for $DISTRO_NAME..."

  # AppImage works everywhere — always build it as fallback
  npm run electron:build:appimage 2>/dev/null || {
    warn "AppImage build failed. Trying with --linux flag..."
    npx electron-builder --linux AppImage --publish never || true
  }

  # Also build native format if different from AppImage
  if [ "$TARGET" != "AppImage" ]; then
    info "Also building native $TARGET format..."
    npx electron-builder --linux "$TARGET" --publish never 2>/dev/null || {
      warn "Native $TARGET build failed — AppImage is still available"
    }
  fi

  echo ""
  success "Packages built! Check the ./release/ directory:"
  echo ""
  if [ -d "release" ]; then
    ls -lah release/*.{AppImage,deb,rpm,pkg.tar.zst} 2>/dev/null || ls -lah release/ 2>/dev/null || true
  fi
}

# ─── Install Icons into XDG directories ───────────────────────────────
install_icons() {
  header "Installing Icons"

  local ICON_SRC="$(pwd)/build/icons"
  local ICON_NAME="help-me-fast"

  if [ ! -d "$ICON_SRC" ]; then
    warn "No build/icons directory found — skipping icon install"
    return
  fi

  # Install each size into the XDG icon hierarchy
  # This is how GNOME, KDE, XFCE, Sway/Wofi, Rofi, etc. find app icons
  for PNG in "$ICON_SRC"/*.png; do
    [ -f "$PNG" ] || continue
    local BASENAME
    BASENAME=$(basename "$PNG" .png)  # e.g. "256x256"
    local SIZE="${BASENAME%%x*}"      # e.g. "256"

    # Validate it's actually a number
    if ! [[ "$SIZE" =~ ^[0-9]+$ ]]; then
      continue
    fi

    local TARGET_DIR="${HOME}/.local/share/icons/hicolor/${SIZE}x${SIZE}/apps"
    mkdir -p "$TARGET_DIR"
    cp "$PNG" "${TARGET_DIR}/${ICON_NAME}.png"
    info "  Installed ${SIZE}x${SIZE} icon"
  done

  # Also install the largest as a scalable fallback
  local LARGEST
  LARGEST=$(ls -S "$ICON_SRC"/*.png 2>/dev/null | head -1)
  if [ -n "$LARGEST" ]; then
    local PIXMAPS_DIR="${HOME}/.local/share/pixmaps"
    mkdir -p "$PIXMAPS_DIR"
    cp "$LARGEST" "${PIXMAPS_DIR}/${ICON_NAME}.png"
    info "  Installed pixmap fallback"
  fi

  # Remove old icon name (e.g. from previous "help-me-faast" typo) so launcher doesn't get confused
  for OLD in "${HOME}/.local/share/icons/hicolor"/*/apps/help-me-faast.png; do
    [ -f "$OLD" ] && rm -f "$OLD" && info "  Removed old icon $(basename "$(dirname "$OLD")")/help-me-faast.png"
  done
  rm -f "${HOME}/.local/share/pixmaps/help-me-faast.png" 2>/dev/null || true

  # Refresh icon cache if available (GNOME, KDE, XFCE)
  if command -v gtk-update-icon-cache &>/dev/null; then
    gtk-update-icon-cache -f -t "${HOME}/.local/share/icons/hicolor" 2>/dev/null || true
  fi

  success "Icons installed into ~/.local/share/icons/"
}

# ─── Create Desktop Entry ─────────────────────────────────────────────
create_desktop_entry() {
  header "Creating Desktop Entry"

  local APPIMAGE
  APPIMAGE=$(find "$(pwd)/release" -name "*.AppImage" -type f 2>/dev/null | head -1)

  if [ -z "$APPIMAGE" ]; then
    warn "No AppImage found in ./release/ — skipping desktop entry"
    return
  fi

  chmod +x "$APPIMAGE"

  # Install icons first so the .desktop file can reference them
  install_icons

  local DESKTOP_DIR="${HOME}/.local/share/applications"
  mkdir -p "$DESKTOP_DIR"

  # Remove old desktop entry if we renamed the app (e.g. faast -> fast)
  rm -f "$DESKTOP_DIR/help-me-faast.desktop"

  local DESKTOP_FILE="$DESKTOP_DIR/help-me-fast.desktop"

  cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=Help Me Fast
Comment=Prolonged fasting companion for Linux
Exec="${APPIMAGE}" --ozone-platform-hint=auto %U
Icon=help-me-fast
Terminal=false
Type=Application
Categories=Utility;Health;
StartupNotify=true
StartupWMClass=help-me-fast
EOF

  # Update desktop database if available
  if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
  fi

  success "Desktop entry created at $DESKTOP_FILE"
  info "The app should now appear in your application launcher with the custom icon"
}

# ─── Dev Mode Launcher ────────────────────────────────────────────────
create_dev_launcher() {
  header "Creating Dev Launcher"

  cat > run-dev.sh <<'DEVEOF'
#!/usr/bin/env bash
# Help Me Fast! — Development Launcher
# Starts Vite + Electron in dev mode

cd "$(dirname "$0")" || exit 1

# Ensure deps are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build Electron files
echo "Building Electron..."
npm run build:electron

# Start with Wayland/X11 auto-detection
echo "Starting Help Me Fast! (dev mode)..."
exec npm run electron:dev
DEVEOF

  chmod +x run-dev.sh
  success "Dev launcher created: ./run-dev.sh"
}

# ─── Main ─────────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${BOLD}${CYAN}"
  echo "  ╔══════════════════════════════════════╗"
  echo "  ║       Help Me Fast! Installer        ║"
  echo "  ║   Prolonged Fasting Companion        ║"
  echo "  ╚══════════════════════════════════════╝"
  echo -e "${NC}"

  detect_distro
  detect_display

  info "Distro:     $DISTRO_NAME (pkg: $PKG_MANAGER)"
  info "Display:    $DISPLAY_SERVER"
  info "Desktop:    ${DE}"
  info "Session:    ${SESSION}"
  echo ""

  # ── Menu ──
  echo -e "${BOLD}What would you like to do?${NC}"
  echo ""
  echo "  1) Full install (deps + build + package)"
  echo "  2) Dev setup only (deps + npm install)"
  echo "  3) Build distributable package only"
  echo "  4) Install system dependencies only"
  echo ""
  read -rp "$(echo -e "${CYAN}Select [1-4]:${NC} ")" CHOICE

  case "${CHOICE:-1}" in
    1)
      install_system_deps
      check_node
      install_npm_deps
      build_app
      build_package
      create_desktop_entry
      create_dev_launcher
      ;;
    2)
      install_system_deps
      check_node
      install_npm_deps
      create_dev_launcher
      ;;
    3)
      check_node
      install_npm_deps
      build_app
      build_package
      create_desktop_entry
      ;;
    4)
      install_system_deps
      ;;
    *)
      error "Invalid choice"
      exit 1
      ;;
  esac

  echo ""
  header "Installation Complete!"
  echo ""
  echo -e "  ${GREEN}To run in dev mode:${NC}"
  echo -e "    ${BOLD}./run-dev.sh${NC}"
  echo ""

  if [ -d "release" ]; then
    local APPIMAGE
    APPIMAGE=$(find "$(pwd)/release" -name "*.AppImage" -type f 2>/dev/null | head -1)
    if [ -n "$APPIMAGE" ]; then
      echo -e "  ${GREEN}To run the built app:${NC}"
      echo -e "    ${BOLD}${APPIMAGE}${NC}"
      echo ""
    fi
  fi

  echo -e "  ${GREEN}Troubleshooting:${NC}"
  echo -e "    ${YELLOW}Wayland issues?${NC}  Run with: --ozone-platform-hint=auto"
  echo -e "    ${YELLOW}GPU issues?${NC}      Set env: ELECTRON_DISABLE_GPU=1"
  echo -e "    ${YELLOW}Blank screen?${NC}    Try: --disable-gpu-sandbox"
  echo ""
}

main "$@"
