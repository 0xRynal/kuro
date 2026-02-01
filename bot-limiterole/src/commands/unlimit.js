const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { removeLimit } = require('../utils/limits');

module.exports = {
    data: { name: 'unlimit' },
    async execute(message, args) {
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('❌ Tu dois avoir la permission Gérer les rôles.');
        }
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply(`❌ Utilisation: \`${config.prefix}unlimit @rôle\``);
        removeLimit(message.guild.id, role.id);
        return message.reply(`✅ Limite supprimée pour ${role}.`);
    },
};
