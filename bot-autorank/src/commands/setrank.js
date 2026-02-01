const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { addRoleThreshold } = require('../utils/autorank');

module.exports = { data: { name: 'setrank' }, async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ Gérer les rôles requis.');
    const at = parseInt(args[0], 10);
    const role = message.mentions.roles?.first() || message.guild.roles.cache.get(args[1]);
    if (!Number.isInteger(at) || at < 1 || !role) return message.reply(`❌ Utilisation: \`${config.prefix}setrank <messages> @role\` Ex: \`${config.prefix}setrank 100 @Staff\``);

    const me = message.guild.members.me;
    if (role.position >= me.roles.highest.position) return message.reply('❌ Ce rôle est au-dessus du mien.');

    addRoleThreshold(message.guild.id, at, role.id);
    return message.reply(`✅ À **${at}** messages → ${role}.`);
}};
