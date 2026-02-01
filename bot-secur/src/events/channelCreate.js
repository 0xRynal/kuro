const { PermissionFlagsBits, AuditLogEvent } = require('discord.js');
const { get } = require('../utils/store');
const config = require('../config');

const lastLog = new Map();
const lastDelete = new Map();
const LOG_COOLDOWN_MS = 5000;
const DELETE_COOLDOWN_MS = 2000;

function isWhitelisted(g, executorId, executorRoles) {
    if (g.antichannelWlUsers?.includes(executorId)) return true;
    if (executorRoles?.some(rid => g.antichannelWlRoles?.includes(rid))) return true;
    return false;
}

module.exports = { name: 'channelCreate', async execute(channel) {
    if (!channel.guild) return;
    if (channel.isThread?.()) return;
    const g = get(channel.guild.id);
    if (!g.antichannel) return;

    try {
        const log = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
        const entry = log.entries.first();
        if (entry?.target?.id === channel.id) {
            const member = await channel.guild.members.fetch(entry.executor.id).catch(() => null);
            const roles = member?.roles?.cache?.map(r => r.id) || [];
            if (isWhitelisted(g, entry.executor.id, roles)) return;
        }
    } catch (_) {}

    const now = Date.now();
    const lastDel = lastDelete.get(channel.guild.id) || 0;
    if (now - lastDel < DELETE_COOLDOWN_MS) return; // Debounce pour éviter boucle création → delete → création

    const me = channel.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageChannels)) return;

    const logId = config.getLogChannelId(channel.guild.id);
    const logCh = logId ? channel.guild.channels.cache.get(logId) : null;
    const sysCh = channel.guild.systemChannel?.id !== channel.id ? channel.guild.systemChannel : null;
    const txtCh = channel.guild.channels.cache.find(c => c.id !== channel.id && c.isTextBased());
    const target = logCh || sysCh || txtCh;
    const name = channel.name;

    try {
        lastDelete.set(channel.guild.id, now);
        await channel.delete('Antichannel: création bloquée');
        const last = lastLog.get(channel.guild.id) || 0;
        if (target && now - last >= LOG_COOLDOWN_MS) {
            lastLog.set(channel.guild.id, now);
            await target.send(`🛡️ **Antichannel** : Le channel \`${name}\` a été supprimé.`).catch(() => {});
        }
    } catch (err) {
        console.error('antichannel:', err);
    }
}};
