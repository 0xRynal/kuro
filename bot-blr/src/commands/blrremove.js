const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { remove, has } = require('../utils/blr');

module.exports = { data: { name: 'blrremove' }, async execute(message, args) {
    if (!message.guild) return;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
    const role = message.mentions.roles?.first() || message.guild.roles.cache.get(args[0]);
    if (!role) return message.reply(`❌ Utilisation: \`${config.prefix}blrremove @role\``);

    if (!has(message.guild.id, role.id)) return message.reply(`❌ ${role} pas blacklisté.`);
    remove(message.guild.id, role.id);
    return message.reply(`✅ ${role} retiré de la blrole.`);
}};
