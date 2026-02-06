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
