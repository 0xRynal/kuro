const fs = require('fs');
const path = require('path');
const VOICE_CHANNEL_ID = process.env.BOT_VOICE_CHANNEL_ID || '1467635993564676106';
const JOIN_ALL_FILE = path.join(__dirname, '..', 'data', 'join_all_bots_vc.json');
const POLL_MS = 5000;
const CMD_TTL_MS = 30000;

async function doJoin(client, channelId, guildId) {
    try {
        let channel = null;
        if (guildId) {
            const guild = client.guilds.cache.get(guildId);
            if (guild) channel = await guild.channels.fetch(channelId).catch(() => null);
        }
        if (!channel) {
            for (const guild of client.guilds.cache.values()) {
                channel = await guild.channels.fetch(channelId).catch(() => null);
                if (channel) break;
            }
        }
        if (!channel) channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel?.isVoiceBased?.()) return false;
        const { joinVoiceChannel } = require('@discordjs/voice');
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        return true;
    } catch (_) { return false; }
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
