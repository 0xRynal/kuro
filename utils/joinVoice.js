const fs = require('fs');
const path = require('path');
const VOICE_CHANNEL_ID = process.env.BOT_VOICE_CHANNEL_ID || '1467635993564676106';
const JOIN_ALL_FILE = path.join(__dirname, '..', 'data', 'join_all_bots_vc.json');
const POLL_MS = 5000;
const CMD_TTL_MS = 30000;

async function doJoin(client, channelId, guildId) {
    try {
        let channel = null;
        const guild = guildId ? client.guilds.cache.get(guildId) : null;
        if (guild) {
            channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
        }
        if (!channel && guild) {
            await guild.channels.fetch().catch(() => {});
            channel = guild.channels.cache.get(channelId);
        }
        if (!channel) {
            for (const g of client.guilds.cache.values()) {
                channel = g.channels.cache.get(channelId) || await g.channels.fetch(channelId).catch(() => null);
                if (channel) break;
            }
        }
        if (!channel) {
            try { channel = await client.channels.fetch(channelId); } catch { return { ok: false, err: 'channel fetch failed' }; }
        }
        if (!channel?.isVoiceBased?.()) return { ok: false, err: 'not voice channel' };
        const adapter = channel.guild.voiceAdapterCreator;
        if (!adapter) return { ok: false, err: 'no voice adapter' };
        const { joinVoiceChannel } = require('@discordjs/voice');
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: adapter,
        });
        return { ok: true };
    } catch (e) { return { ok: false, err: e.message || 'unknown' }; }
}

async function joinVoiceOnReady(client) {
    await doJoin(client, VOICE_CHANNEL_ID);
    startPolling(client);
}

function writeJoinAllCommand(channelId, guildId) {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(JOIN_ALL_FILE, JSON.stringify({ channelId, guildId: guildId || null, requestedAt: Date.now() }), 'utf8');
}

function startPolling(client) {
    let lastProcessedAt = 0;
    setInterval(async () => {
        try {
            if (!fs.existsSync(JOIN_ALL_FILE)) return;
            const data = JSON.parse(fs.readFileSync(JOIN_ALL_FILE, 'utf8'));
            const { channelId, guildId, requestedAt } = data;
            if (!channelId || requestedAt <= lastProcessedAt) return;
            if (Date.now() - requestedAt > CMD_TTL_MS) return;
            lastProcessedAt = requestedAt;
            await doJoin(client, channelId, guildId);
        } catch (_) {}
    }, POLL_MS);
}

module.exports = { joinVoiceOnReady, doJoin, writeJoinAllCommand, startPolling };
