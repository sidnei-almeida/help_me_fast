#!/usr/bin/env bash
# Help Me Fast! — Uninstall (removes icons and menu entry)
# Does not remove the AppImage or project files, only system integration.

set -euo pipefail

DESKTOP_FILE="${HOME}/.local/share/applications/help-me-fast.desktop"
DESKTOP_OLD="${HOME}/.local/share/applications/help-me-faast.desktop"
ICON_NAME="help-me-fast"
ICON_OLD="help-me-faast"
ICON_DIR="${HOME}/.local/share/icons/hicolor"
PIXMAPS="${HOME}/.local/share/pixmaps"

echo "Removing Help Me Fast from system (icons + menu)..."
echo ""

# Menu entry
rm -f "$DESKTOP_FILE" "$DESKTOP_OLD"
echo "  ✓ Menu entry removed"

# Hicolor icons
for dir in "$ICON_DIR"/*/apps; do
  [ -d "$dir" ] || continue
  rm -f "$dir/${ICON_NAME}.png" "$dir/${ICON_OLD}.png" 2>/dev/null || true
done
echo "  ✓ Hicolor icons removed"

# Pixmaps
rm -f "${PIXMAPS}/${ICON_NAME}.png" "${PIXMAPS}/${ICON_OLD}.png" 2>/dev/null || true
echo "  ✓ Pixmaps removed"

# Refresh icon cache (GNOME, KDE, etc.)
if command -v gtk-update-icon-cache &>/dev/null; then
  gtk-update-icon-cache -f -t "$ICON_DIR" 2>/dev/null || true
  echo "  ✓ Icon cache updated"
fi

if command -v update-desktop-database &>/dev/null; then
  update-desktop-database "${HOME}/.local/share/applications" 2>/dev/null || true
fi

echo ""
echo "Done. The app has been removed from the menu and icons uninstalled."
echo "To install again (e.g. to test a different icon), run: ./install.sh"
echo "  and choose option 3 (Build + desktop entry) or 1 (full install)."
