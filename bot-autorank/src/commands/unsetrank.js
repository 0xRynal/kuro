const config = require('../config');
const { removeRoleThreshold } = require('../utils/autorank');

module.exports = { data: { name: 'unsetrank' }, async execute(message, args) {
    if (!message.member.permissions.has(require('discord.js').PermissionFlagsBits.ManageRoles)) return message.reply('❌ Gérer les rôles requis.');
    const at = parseInt(args[0], 10);
    if (!Number.isInteger(at) || at < 1) return message.reply(`❌ Utilisation: \`${config.prefix}unsetrank <messages>\` Ex: \`${config.prefix}unsetrank 100\``);

    removeRoleThreshold(message.guild.id, at);
    return message.reply(`✅ Seuil ${at} messages supprimé.`);
}};
