const config = require('../config');
const { full, canSanction } = require('../utils/perms');
const { getRolePerms } = require('../utils/rolePerms');

function getRolesWithPerms(guildId) {
    const data = getRolePerms(guildId);
    const ids = new Set();
    for (const arr of Object.values(data)) {
        for (const id of arr) ids.add(id);
    }
    return [...ids];
}

module.exports = {
    data: { name: 'demote' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!full(message.author.id, message.guild.id)) return message.reply('❌ Full perm requis.');
        const target = message.mentions.members?.first();
        if (!target) return message.reply(`❌ Usage: \`${config.prefix}demote @user\``);
        if (target.id === message.author.id) return message.reply('❌ Pas de self-demote.');
        if (!full(message.author.id) && !canSanction(message.member, target)) return message.reply('❌ Hiérarchie.');
        const roleIdsWithPerms = getRolesWithPerms(message.guild.id);
        const toRemove = target.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id && roleIdsWithPerms.includes(r.id));
        if (!toRemove.size) return message.reply(`📋 ${target} n'a aucun rôle avec perms assignées.`);
        try {
            await target.roles.remove(toRemove, `Démote par ${message.author.tag}`);
            const names = toRemove.map(r => r.name).join(', ');
            await message.reply(`✅ ${target} démote: rôles retirés: ${names}.`);
        } catch (e) {
            const { safeReply } = require('../utils/messages');
            await safeReply(message, '❌ Impossible de retirer les rôles (hiérarchie ou permissions manquantes).');
        }
    },
};
