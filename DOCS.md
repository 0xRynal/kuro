# Bots Commu — Documentation

## Variables d'environnement

```env
TOKEN=...
TOKEN_BL=...
TOKEN_GESTION=...
TOKEN_SECUR=...
TOKEN_STATS=...
TOKEN_VOICE=...
TOKEN_AUTORANK=...
TOKEN_LIMITEROLE=...
TOKEN_BLR=...
TOKEN_COIN=...
TOKEN_MINIJEU=...
LOG_CHANNEL_ID=...
FULL_PERM_IDS=...
HIGH_RANK_ROLE_ID=... (optionnel, pour renew)
COIN_WALLETS_PATH=...
TOKEN_MODMAIL=...
MODMAIL_GUILD_ID=...
MODMAIL_CATEGORY_ID=...
MODMAIL_STAFF_ROLES=... (IDs séparés par virgule)
```

---

## Bots

| Bot | Préfixe | Rôle |
|-----|---------|------|
| **bot-gestion** | `.` | warn, sanctions, mute, ban, lock, wl... |
| **bot-bl** | `?` | Blacklist users |
| **bot-secur** | `~` | antiban, antibot, antirole, antichannel |
| **bot-stats** | `;` | Membres + en vocal |
| **bot-voice** | `!` | move, voicemute, deafen, deco |
| **bot-autorank** | `=` | 100 msg = rank, etc. |
| **bot-limiterole** | `-` | Limite membres par rôle |
| **bot-blr** | `*` | Blacklist rôles |
| **bot-coin** | `^` | Économie |
| **bot-minijeu** | `$` | Mini-jeux + retrait → bot-coin |
| **bot-giveaway** | `/` | Giveaways (leave) |
| **bot-modmail** | `\` | Tickets par DM |

---

## Config par commande (sans hardcoder)

Chaque bot expose `!<prefix>set` pour configurer channels/rôles sans modifier le .env :

| Bot | Commande | Options |
|-----|----------|---------|
| **modmail** | `\ set <guild\|category\|log\|staff> <id>` | guild, category, log, staff (rôles) |
| **gestion** | `. set <log\|fullperm\|highrank> <id>` | log, fullperm (userIds), highrank (roleId) |
| **bl** | `? set log <channelId>` | log |
| **secur** | `~ set log <channelId>` | log |
| **minijeu** | `$ set <games\|log\|punitions\|highrank\|fullperm> <id>` | games, log, punitions, highrank, fullperm |

Config sauvegardée dans `data/<bot>_config.json` ou `data/modmail_config.json`. L'env reste le fallback.

---

## bot-modmail

L'utilisateur envoie un DM au bot → création d'un channel ticket sur le serveur. Le staff répond dans le channel → l'utilisateur reçoit en DM.

**Env (fallback) :** `TOKEN_MODMAIL`, `MODMAIL_GUILD_ID`, `MODMAIL_CATEGORY_ID`, `MODMAIL_STAFF_ROLES` (IDs rôles séparés par virgule).

---

## Créer le .env

**Windows :**
```bash
copy .env.example .env
```

**Linux / Mac / VPS :**
```bash
cp .env.example .env
```

Puis éditer `.env` et renseigner les tokens.

---

## Lancer

```bash
# Un seul bot
cd bot-<nom>
npm i
npm start

# Tous les bots (exécuter install-all.js une fois avant)
node install-all.js
node start-all.js
```

## Lister IDs et URLs d'invite

```bash
node bot-ids.js
```

Lit le `.env` et affiche l'ID + l'URL d'invite pour chaque bot.

---

## Déploiement VPS (Ubuntu)

**Chemin :** `/opt/kuro`

```bash
# Cloner
sudo git clone https://github.com/0xRynal/kuro.git /opt/kuro

# Fixer les perms (script fourni)
sudo chmod +x /opt/kuro/setup-vps.sh
sudo /opt/kuro/setup-vps.sh /opt/kuro ubuntu

# Ou manuellement :
sudo chown -R ubuntu:ubuntu /opt/kuro
sudo chmod -R 755 /opt/kuro

# Créer .env et installer
cd /opt/kuro
cp .env.example .env
nano .env   # renseigner les tokens
node install-all.js

# Lancer
node start-all.js
```

**PM2 (recommandé pour tourner en arrière-plan) :**
```bash
npm i -g pm2
pm2 start start-all.js --name kuro
pm2 save
pm2 startup
```

---

## Cohérence logique (audit)

- **DM** : toutes les commandes guild-only vérifient `if (!message.guild) return` (gestion, bl, secur, voice, blr, coin)
- **Permissions** : `message.member?.permissions` (optional chaining)
- **ban** : hiérarchie via `targetUser.roles?.highest` et `canSanction(member, targetUser)`
- **perms.canSanction** : garde `if (!target?.guild) return true` pour éviter crash
- **bot-bl** : self-bl, bot-bl, fetch user pour ID
- **bot-secur** : antiban ignore bans par bots ; antichannel exclut le channel supprimé du target de log
- **antiban/antibot** : unwl/unprotect supportent @user|ID
