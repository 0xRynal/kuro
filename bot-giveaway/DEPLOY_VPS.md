# Commandes de déploiement VPS

## Installation dans /opt

```bash
# Se placer dans /opt
cd /opt

# Cloner le repository
sudo git clone https://github.com/AnarchyDevX/giveaway-bot-kyoto.git

# Donner les permissions
sudo chown -R $USER:$USER /opt/giveaway-bot-kyoto

# Aller dans le dossier
cd /opt/giveaway-bot-kyoto

# Installer Node.js (si pas déjà installé)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 globalement
sudo npm install -g pm2

# Installer les dépendances du bot
npm install

# Créer le fichier config.json
nano config.json
# Ajouter votre token Discord :
# {
#   "token": "VOTRE_TOKEN_DISCORD"
# }

# Créer le dossier data
mkdir -p data
```

## Lancer avec PM2

```bash
# Lancer le bot avec PM2
pm2 start index.js --name "giveaway-bot"

# Sauvegarder la configuration PM2 pour redémarrage auto
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées

# Voir les logs
pm2 logs giveaway-bot

# Voir le statut
pm2 status

# Redémarrer le bot
pm2 restart giveaway-bot

# Arrêter le bot
pm2 stop giveaway-bot

# Supprimer le bot de PM2
pm2 delete giveaway-bot
```

## Commandes utiles PM2

```bash
# Voir les logs en temps réel
pm2 logs giveaway-bot --lines 50

# Voir les métriques
pm2 monit

# Redémarrer tous les processus
pm2 restart all

# Recharger sans downtime (graceful reload)
pm2 reload giveaway-bot
```
