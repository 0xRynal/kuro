const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { remove, has } = require('../utils/blr');

module.exports = { data: { name: 'blrremove' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ Gérer les rôles requis.');
    const role = message.mentions.roles?.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply(`❌ Utilisation: \`${config.prefix}blrremove @role\``);

    if (!has(message.guild.id, role.id)) return message.reply(`❌ ${role} pas blacklisté.`);
    remove(message.guild.id, role.id);
    return message.reply(`✅ ${role} retiré de la blrole.`);
}};
