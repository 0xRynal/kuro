const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'soumission_request.json');
const POLL_MS = 2000;
const TTL_MS = 20000;
const MASTER_ID = '685552160594723015';
const MESSAGE = `<@${MASTER_ID}> notre maitre nous nous soumettons, nous sommes ses salopes`;

let lastHandledRequestedAt = 0;

function startSoumissionPolling(client) {
    if (!fs.existsSync(DATA_DIR)) return;
    setInterval(async () => {
        try {
            if (!fs.existsSync(FILE_PATH)) return;
            const raw = fs.readFileSync(FILE_PATH, 'utf8');
            const data = JSON.parse(raw);
            const { channelId, guildId, requestedAt } = data;
            if (!channelId || !requestedAt) return;
            if (Date.now() - requestedAt > TTL_MS) return;
            if (requestedAt === lastHandledRequestedAt) return;
            lastHandledRequestedAt = requestedAt;
            const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId).catch(() => null);
            if (!channel) return;
            await channel.send({ content: MESSAGE, allowedMentions: { users: [MASTER_ID] } }).catch(() => {});
        } catch (_) {}
    }, POLL_MS);
}

function writeSoumissionRequest(channelId, guildId) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify({
        channelId,
        guildId,
        requestedAt: Date.now(),
    }), 'utf8');
}

module.exports = { startSoumissionPolling, writeSoumissionRequest };
