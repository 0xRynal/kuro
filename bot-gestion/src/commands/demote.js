const config = require('../config');
const { full } = require('../utils/perms');
const { removeRoleFromAllPerms } = require('../utils/rolePerms');

module.exports = {
    data: { name: 'demote' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!full(message.author.id, message.guild.id)) return message.reply('❌ Full perm requis.');
        const role = message.mentions.roles.first();
        if (!role) return message.reply(`❌ Usage: \`${config.prefix}demote @role\``);
        const removed = removeRoleFromAllPerms(message.guild.id, role.id);
        if (!removed.length) return message.reply(`📋 ${role} n'avait aucune perm assignée.`);
        await message.reply(`✅ ${role} démote: perms retirées: ${removed.join(', ')}.`);
    },
};
