# Bot Discord - Giveaway avec système d'invites

Bot Discord en JavaScript pour gérer des giveaways avec suivi des invitations.

## Fonctionnalités

- **Système de Giveaway** : Créer des giveaways avec paramètres personnalisables
- **Tracking des Invites** : Suivi automatique du nombre de membres invités par chaque utilisateur
- **Conditions d'invites** : Définir un nombre minimum d'invites requis pour participer
- **Commande Reroll** : Reroll des gagnants avec nombre de participants personnalisable

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer le fichier `config.json` à partir de `config.json.example` et y ajouter votre token Discord :
```json
{
  "token": "VOTRE_TOKEN_DISCORD"
}
```

3. Lancer le bot :
```bash
npm start
```

## Commandes

### `/giveaway start`
Crée un nouveau giveaway.

**Paramètres :**
- `gagnants` : Nombre de gagnants (requis)
- `duree` : Durée du giveaway (ex: `1h`, `30m`, `1d`) (requis)
- `lot` : Lot à gagner (requis)
- `invites` : Nombre d'invites requises pour participer (optionnel, défaut: 0)

**Exemple :**
```
/giveaway start gagnants:3 duree:1h lot:Nitro Discord invites:5
```

### `/giveaway reroll`
Reroll un giveaway terminé.

**Paramètres :**
- `id` : ID court du giveaway (visible dans le message, ex: `ABC123`) (requis)
- `nombre` : Nombre de gagnants à reroll (optionnel, défaut: 1)

**Exemple :**
```
/giveaway reroll id:ABC123 nombre:2
```

Si l'ID est invalide, le bot affichera automatiquement la liste des giveaways actifs avec leurs IDs.

### `/giveaway list`
Liste tous les giveaways actifs du serveur avec leurs IDs uniques.

**Exemple :**
```
/giveaway list
```

### `/invites`
Affiche le nombre d'invites d'un utilisateur.

**Paramètres :**
- `utilisateur` : Utilisateur à vérifier (optionnel, défaut: vous-même)

**Exemple :**
```
/invites utilisateur:@User
```

## Système de tracking des invites

Le bot suit automatiquement le nombre de membres invités par chaque utilisateur via leurs liens d'invitation personnels. Ce système est utilisé pour vérifier les conditions d'invites requises pour participer aux giveaways.

## Système d'ID unique

Chaque giveaway reçoit un ID unique court (ex: `ABC123`) qui est affiché dans le message du giveaway. Cet ID permet d'identifier facilement un giveaway spécifique parmi plusieurs giveaways actifs simultanément. Utilisez `/giveaway list` pour voir tous les giveaways actifs avec leurs IDs.

## Structure des données

Les données sont stockées dans le dossier `data/` :
- `invites.json` : Données des invites par utilisateur
- `giveaways.json` : Données des giveaways actifs et terminés

## Permissions requises

Le bot nécessite les permissions suivantes :
- Lire les messages
- Envoyer des messages
- Gérer les messages
- Utiliser les commandes slash
- Voir les invites du serveur
