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
| **bot-gestion** | `!g` | warn, sanctions, mute, ban, lock, wl... |
| **bot-bl** | `!b` | Blacklist users |
| **bot-secur** | `!s` | antiban, antibot, antirole, antichannel |
| **bot-stats** | `!t` | Membres + en vocal |
| **bot-voice** | `!v` | move, voicemute, deafen, deco |
| **bot-autorank** | `!a` | 100 msg = rank, etc. |
| **bot-limiterole** | `!l` | Limite membres par rôle |
| **bot-blr** | `!r` | Blacklist rôles |
| **bot-coin** | `!c` | Économie |
| **bot-minijeu** | `!j` | Mini-jeux + retrait → bot-coin |
| **bot-giveaway** | `/` | Giveaways |
| **bot-modmail** | `!m` | Tickets par DM |

---

## Config par commande (sans hardcoder)

Chaque bot expose `!<prefix>set` pour configurer channels/rôles sans modifier le .env :

| Bot | Commande | Options |
|-----|----------|---------|
| **modmail** | `!m set <guild\|category\|log\|staff> <id>` | guild, category, log, staff (rôles) |
| **gestion** | `!g set <log\|fullperm\|highrank> <id>` | log, fullperm (userIds), highrank (roleId) |
| **bl** | `!b set log <channelId>` | log |
| **secur** | `!s set log <channelId>` | log |
| **minijeu** | `!j set <games\|log\|punitions\|highrank\|fullperm> <id>` | games, log, punitions, highrank, fullperm |

Config sauvegardée dans `data/<bot>_config.json` ou `data/modmail_config.json`. L'env reste le fallback.

---

## bot-modmail

L'utilisateur envoie un DM au bot → création d'un channel ticket sur le serveur. Le staff répond dans le channel → l'utilisateur reçoit en DM.

**Env (fallback) :** `TOKEN_MODMAIL`, `MODMAIL_GUILD_ID`, `MODMAIL_CATEGORY_ID`, `MODMAIL_STAFF_ROLES` (IDs rôles séparés par virgule).

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

## Cohérence logique (audit)

- **DM** : toutes les commandes guild-only vérifient `if (!message.guild) return` (gestion, bl, secur, voice, blr, coin)
- **Permissions** : `message.member?.permissions` (optional chaining)
- **ban** : hiérarchie via `targetUser.roles?.highest` et `canSanction(member, targetUser)`
- **perms.canSanction** : garde `if (!target?.guild) return true` pour éviter crash
- **bot-bl** : self-bl, bot-bl, fetch user pour ID
- **bot-secur** : antiban ignore bans par bots ; antichannel exclut le channel supprimé du target de log
- **antiban/antibot** : unwl/unprotect supportent @user|ID
