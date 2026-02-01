const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { removeLimit } = require('../utils/limits');

module.exports = {
    data: { name: 'unlimit' },
    async execute(message, args) {
        const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply(`❌ Utilisation: \`${config.prefix}unlimit @rôle\``);
        removeLimit(message.guild.id, role.id);
        return message.reply(`✅ Limite supprimée pour ${role}.`);
    },
};
