#!/bin/bash
# À exécuter en sudo pour fixer les perms avant de lancer les bots
DIR="${1:-/opt/kuro}"
USER="${2:-ubuntu}"

if [ ! -d "$DIR" ]; then
  echo "❌ Dossier introuvable: $DIR"
  exit 1
fi

echo "Permissions pour $DIR (user: $USER)..."
chown -R $USER:$USER "$DIR"
chmod -R 755 "$DIR"
chmod 644 "$DIR/.env" 2>/dev/null || true

echo "✅ Fait. Lance avec: cd $DIR && node start-all.js"
