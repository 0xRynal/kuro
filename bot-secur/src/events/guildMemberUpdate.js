const { PermissionFlagsBits } = require('discord.js');
const { get } = require('../utils/store');
const { isKuroBot } = require('../utils/kuroBots');

module.exports = { name: 'guildMemberUpdate', async execute(oldMember, newMember) {
    if (isKuroBot(newMember.user.id)) return;
    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    if (!added.size) return;
    const g = get(newMember.guild.id);
    if (!g.antirole || !g.roleBlacklist.length) return;

    const toRemove = added.filter(r => g.roleBlacklist.includes(r.id));
    if (!toRemove.size) return;
    const me = newMember.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) return;

    for (const role of toRemove.values()) {
        if (role.position < me.roles.highest.position) await newMember.roles.remove(role, 'Antirole: rôle blacklisté').catch(() => {});
    }
}};
