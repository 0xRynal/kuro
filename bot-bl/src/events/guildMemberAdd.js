const { PermissionFlagsBits } = require('discord.js');
const { getEntry } = require('../utils/bl');
const config = require('../config');

module.exports = { name: 'guildMemberAdd', async execute(member) {
    if (member.user.bot) return;
    const entry = getEntry(member.guild.id, member.id);
    if (!entry) return;
    if (!member.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return;

    const levelsStr = entry.levels.map(l => `Niv.${l.level} (${l.reason})`).join(' · ');
    try {
        await member.ban({ reason: `Auto-ban BL: ${levelsStr}` });
        const logId = config.getLogChannelId(member.guild.id);
        const ch = logId ? member.guild.channels.cache.get(logId) : member.guild.systemChannel;
        if (ch) await ch.send(`🔨 **BL** : ${member.user.tag} — ${levelsStr} — banni.`).catch(() => {});
    } catch (e) {
        console.error('bl auto-ban:', e);
    }
}};
