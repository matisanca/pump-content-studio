#!/bin/bash
cd "$(dirname "$0")"
echo "📦 Subiendo cambios a GitHub Pages..."
git add -A
git commit -m "update $(date '+%d/%m/%Y %H:%M')" 2>/dev/null || echo "Sin cambios nuevos"
git push origin main
echo "✅ Listo! Los cambios van a estar en vivo en 1-2 minutos"
echo "🌐 https://matisanca.github.io/pump-content-studio/"
