const config = require('../config');
const { isStaffRole } = require('../utils/rolePerms');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        if (!newMember?.guild) return;
        const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
        if (addedRoles.size === 0) return;

        const hasNewStaffRole = addedRoles.some(r => isStaffRole(r, newMember.guild.id));
        if (!hasNewStaffRole) return;

        const channelId = config.getConfig(newMember.guild.id).welcomeStaffChannelId;
        if (!channelId) return;

        const channel = newMember.guild.channels.cache.get(channelId) || await newMember.guild.channels.fetch(channelId).catch(() => null);
        if (!channel) return;

        const serverName = newMember.guild.name;
        await channel.send(`${newMember} bienvenue dans le staff de **${serverName}** !`).catch(() => {});
    },
};
