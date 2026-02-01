const { AuditLogEvent, PermissionFlagsBits } = require('discord.js');
const { get } = require('../utils/store');
const config = require('../config');

module.exports = { name: 'guildBanAdd', async execute(ban) {
    const g = get(ban.guild.id);
    if (!g.antiban) return;
    if (!g.protectedUsers.length) return;
    if (!g.protectedUsers.includes(ban.user.id)) return;

    const me = ban.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.BanMembers)) return;

    try {
        const log = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
        const e = log.entries.first();
        if (e?.executor?.bot) return; // Ne jamais déban si c'est un bot qui a banni
        if (e && e.target?.id === ban.user.id && g.allowedBanners.includes(e.executor?.id)) return;
        await ban.guild.members.unban(ban.user.id, 'Antiban: utilisateur protégé');
        const logId = config.getLogChannelId(ban.guild.id);
        const ch = logId ? ban.guild.channels.cache.get(logId) : ban.guild.systemChannel;
        if (ch) await ch.send(`🛡️ **Antiban** : ${ban.user.tag} (protégé) a été débanni.`).catch(() => {});
    } catch (err) {
        console.error('antiban:', err);
    }
}};
