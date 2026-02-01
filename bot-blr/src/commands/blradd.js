const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { add, has } = require('../utils/blr');

module.exports = { data: { name: 'blradd' }, async execute(message, args) {
    if (!message.guild) return;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
    const role = message.mentions.roles?.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply(`❌ Utilisation: \`${config.prefix}blradd @role\``);
    if (has(message.guild.id, role.id)) return message.reply(`❌ ${role} déjà blacklisté.`);
    add(message.guild.id, role.id);
    return message.reply(`✅ ${role} blacklisté (blrole).`);
}};
