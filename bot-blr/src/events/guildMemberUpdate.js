const { PermissionFlagsBits } = require('discord.js');
const { get } = require('../utils/blr');

module.exports = { name: 'guildMemberUpdate', async execute(oldMember, newMember) {
    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    if (!added.size) return;
    const list = get(newMember.guild.id);
    if (!list.length) return;

    const me = newMember.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) return;

    for (const role of added.values()) {
        if (!list.includes(role.id)) continue;
        if (role.position >= me.roles.highest.position) continue;
        try {
            await newMember.roles.remove(role, 'BLRole: rôle blacklisté');
        } catch (e) {
            console.error('blr:', e);
        }
    }
}};
