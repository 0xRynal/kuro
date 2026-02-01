const path = require('path');
const fs = require('fs');

const TOKEN_KEYS = [
    'TOKEN_GESTION', 'TOKEN_BL', 'TOKEN_SECUR', 'TOKEN_STATS', 'TOKEN_VOICE',
    'TOKEN_AUTORANK', 'TOKEN_LIMITEROLE', 'TOKEN_BLR', 'TOKEN_COIN',
    'TOKEN_MINIJEU', 'TOKEN_MODMAIL', 'TOKEN_GIVEAWAY', 'DISCORD_TOKEN', 'TOKEN'
];

function getIdFromToken(token) {
    try {
        const base64 = (token || '').split('.')[0];
        return base64 ? Buffer.from(base64, 'base64').toString('utf8') : null;
    } catch { return null; }
}

let _cache = null;
function getKuroBotIds() {
    if (_cache) return _cache;
    const ids = new Set();
    for (const key of TOKEN_KEYS) {
        let token = process.env[key];
        if (!token && key === 'TOKEN_GIVEAWAY') {
            try {
                const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'bot-giveaway', 'config.json'), 'utf8'));
                token = cfg?.token;
            } catch {}
        }
        const id = getIdFromToken(token);
        if (id) ids.add(id);
    }
    const explicit = (process.env.KURO_BOT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    explicit.forEach(id => ids.add(id));
    _cache = [...ids];
    return _cache;
}

function isKuroBot(userId) {
    return getKuroBotIds().includes(userId);
}

module.exports = { getKuroBotIds, isKuroBot };
