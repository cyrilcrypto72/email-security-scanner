
#!/bin/bash

cd "$(dirname "$0")"

echo "📁 Position : $(pwd)"

git status

read -p "✅ Continuer et tout pousser sur GitHub ? (o/n) : " confirm

if [[ "$confirm" != "o" ]]; then
    echo "⛔️ Annulé."
    exit 1
fi

git add .
echo "✅ Fichiers ajoutés."

read -p "💬 Message du commit : " message

git commit -m "$message"
echo "✅ Commit créé."

git push origin main
echo "🚀 Push terminé. Vérifie sur GitHub !"

