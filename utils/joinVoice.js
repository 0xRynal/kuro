const fs = require('fs');
const path = require('path');
const VOICE_CHANNEL_ID = process.env.BOT_VOICE_CHANNEL_ID || '1467635993564676106';
const JOIN_ALL_FILE = path.join(__dirname, '..', 'data', 'join_all_bots_vc.json');
const POLL_MS = 5000;
const CMD_TTL_MS = 30000;

async function doJoin(client, channelId) {
    try {
        const channel = await client.channels.fetch(channelId).catch(() => null);
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

function writeJoinAllCommand(channelId) {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(JOIN_ALL_FILE, JSON.stringify({ channelId, requestedAt: Date.now() }), 'utf8');
}

function startPolling(client) {
    let lastProcessedAt = 0;
    setInterval(async () => {
        try {
            if (!fs.existsSync(JOIN_ALL_FILE)) return;
            const data = JSON.parse(fs.readFileSync(JOIN_ALL_FILE, 'utf8'));
            const { channelId, requestedAt } = data;
            if (!channelId || requestedAt <= lastProcessedAt) return;
            if (Date.now() - requestedAt > CMD_TTL_MS) return;
            lastProcessedAt = requestedAt;
            await doJoin(client, channelId);
        } catch (_) {}
    }, POLL_MS);
}

module.exports = { joinVoiceOnReady, doJoin, writeJoinAllCommand, startPolling };
