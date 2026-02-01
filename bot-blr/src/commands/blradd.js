const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { add, has } = require('../utils/blr');

module.exports = { data: { name: 'blradd' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ Gérer les rôles requis.');
    const role = message.mentions.roles?.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply(`❌ Utilisation: \`${config.prefix}blradd @role\``);
    if (has(message.guild.id, role.id)) return message.reply(`❌ ${role} déjà blacklisté.`);
    add(message.guild.id, role.id);
    return message.reply(`✅ ${role} blacklisté (blrole).`);
}};
