#!/usr/bin/env bash
# Help Me Fast! — Desinstalação (remove ícones e entrada do menu)
# Não remove o AppImage nem o projeto, só a integração no sistema.

set -euo pipefail

DESKTOP_FILE="${HOME}/.local/share/applications/help-me-fast.desktop"
DESKTOP_OLD="${HOME}/.local/share/applications/help-me-faast.desktop"
ICON_NAME="help-me-fast"
ICON_OLD="help-me-faast"
ICON_DIR="${HOME}/.local/share/icons/hicolor"
PIXMAPS="${HOME}/.local/share/pixmaps"

echo "Removendo Help Me Fast do sistema (ícones + menu)..."
echo ""

# Entrada do menu
rm -f "$DESKTOP_FILE" "$DESKTOP_OLD"
echo "  ✓ Entrada do menu removida"

# Ícones hicolor
for dir in "$ICON_DIR"/*/apps; do
  [ -d "$dir" ] || continue
  rm -f "$dir/${ICON_NAME}.png" "$dir/${ICON_OLD}.png" 2>/dev/null || true
done
echo "  ✓ Ícones hicolor removidos"

# Pixmaps
rm -f "${PIXMAPS}/${ICON_NAME}.png" "${PIXMAPS}/${ICON_OLD}.png" 2>/dev/null || true
echo "  ✓ Pixmaps removidos"

# Atualizar cache de ícones (GNOME, KDE, etc.)
if command -v gtk-update-icon-cache &>/dev/null; then
  gtk-update-icon-cache -f -t "$ICON_DIR" 2>/dev/null || true
  echo "  ✓ Cache de ícones atualizado"
fi

if command -v update-desktop-database &>/dev/null; then
  update-desktop-database "${HOME}/.local/share/applications" 2>/dev/null || true
fi

echo ""
echo "Pronto. O app sumiu do menu e os ícones foram removidos."
echo "Para instalar de novo (ex.: para testar outro ícone), rode: ./install.sh"
echo "  e escolha a opção 3 (Build + desktop entry) ou 1 (instalação completa)."
