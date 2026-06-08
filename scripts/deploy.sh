#!/bin/bash
set -e

echo "🚀 Comprobando cambios sin commits..."
if [[ -n $(git status --porcelain) ]]; then
    git add -A
    git commit -m "cambios locales antes del deploy"
fi

echo "🔨 Compilando Angular..."
npm run build

echo "📦 Agregando dist/ al commit..."
git add -f dist/

echo "✅ Commit de deploy..."
git commit -m "build: deploy $(date '+%Y-%m-%d %H:%M')"

echo "⬆️ Subiendo a GitHub..."
git push

echo "🎉 Deploy completado"
