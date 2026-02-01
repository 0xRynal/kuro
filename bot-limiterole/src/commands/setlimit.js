const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { setLimit } = require('../utils/limits');

module.exports = {
    data: { name: 'setlimit' },
    async execute(message, args) {
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply('❌ Tu dois avoir la permission Gérer les rôles.');
        }
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        const max = parseInt(args[1], 10);
        if (!role || !Number.isInteger(max) || max < 1) {
            return message.reply(`❌ Utilisation: \`${config.prefix}setlimit @rôle <nombre>\` Ex: \`${config.prefix}setlimit @VIP 5\``);
        }
        const n = setLimit(message.guild.id, role.id, max);
        return message.reply(`✅ Rôle ${role} limité à **${n}** membre(s).`);
    },
};
