const config = require('../config');
const p = config.prefix;
const invalidUsage = {
    ban: `❌ Utilisation: \`${p}ban @user|ID [raison]\``,
    unban: `❌ Utilisation: \`${p}unban @user|ID\``,
    mute: `❌ Utilisation: \`${p}mute @user <durée> [raison]\` Ex: \`${p}mute @user 30m spam\``,
    unmute: `❌ Utilisation: \`${p}unmute @user\``,
    timeout: `❌ Utilisation: \`${p}timeout @user <durée> [raison]\` Ex: \`${p}timeout @user 1h\``,
    untimeout: `❌ Utilisation: \`${p}untimeout @user\``,
    slowmode: `❌ Utilisation: \`${p}slowmode <secondes> <durée>\` Ex: \`${p}slowmode 15 5m\``,
    wladd: `❌ Utilisation: \`${p}wladd @role\``,
    wlremove: `❌ Utilisation: \`${p}wlremove @role\``,
    setadmin: `❌ Utilisation: \`${p}setadmin @role\``,
};
module.exports = {
    getRandomNoPermission: () => '❌ Tu n\'as pas les droits.',
    getRandomWrongChannel: () => '❌ Utilise le channel punitions.',
    getRandomError: () => '❌ Une erreur s\'est produite.',
    getRandomInvalidUsage: (c) => invalidUsage[c] || '❌ Utilisation invalide.',
    getRandomUserNotFound: () => '❌ Utilisateur introuvable.',
    getRandomAlclientReadyWhitelisted: (r) => `❌ Le rôle ${r} est déjà dans la whitelist.`,
    getRandomNotWhitelisted: (r) => `❌ Le rôle ${r} n'est pas dans la whitelist.`,
    getRandomBotPermission: () => '❌ Je n\'ai pas les permissions nécessaires.',
    getRandomSelfSanction: () => '❌ Tu ne peux pas te sanctionner toi-même.',
    getRandomBotSanction: () => '❌ Tu ne peux pas sanctionner le bot.',
    getRandomHierarchy: () => '❌ Hiérarchie insuffisante.',
    getRandomInvalidDuration: () => `❌ Durée invalide. Format: 5m, 1h. Ex: \`${p}mute @user 30m\``,
    getRandomRoleCreationError: () => '❌ Erreur lors de la création du rôle Muted.',
    getRandomRoleNotFound: () => '❌ Rôle Muted introuvable.',
    getRandomNotMuted: () => '❌ Cet utilisateur n\'est pas mute.',
    getRandomNotTimeouted: () => '❌ Cet utilisateur n\'est pas en timeout.',
};
