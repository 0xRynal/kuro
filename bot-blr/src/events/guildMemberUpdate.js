const { PermissionFlagsBits } = require('discord.js');
const { isBlacklisted, getRolesWithPerms } = require('../utils/blr');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        if (!isBlacklisted(newMember.guild.id, newMember.id)) return;
        const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
        if (!added.size) return;
        const roleIds = getRolesWithPerms(newMember.guild);
        const toRemove = added.filter(r => roleIds.includes(r.id));
        if (!toRemove.size) return;
        const me = newMember.guild.members.me;
        if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) return;
        for (const role of toRemove.values()) {
            if (role.position >= me.roles.highest.position) continue;
            try {
                await newMember.roles.remove(role, 'BLRole: user blacklisté');
            } catch (e) {
                console.error('blr:', e);
            }
        }
    },
};
