const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', '..', 'data');
const path_ = path.join(dataDir, 'warns.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function load() {
    if (!fs.existsSync(path_)) return {};
    try { return JSON.parse(fs.readFileSync(path_, 'utf8')); } catch { return {}; }
}

function save(d) {
    fs.writeFileSync(path_, JSON.stringify(d, null, 2), 'utf8');
}

function getWarns(guildId, userId) {
    const d = load();
    const g = d[guildId] || {};
    return g[userId] || [];
}

function addWarn(guildId, userId, reason, by) {
    const d = load();
    if (!d[guildId]) d[guildId] = {};
    if (!d[guildId][userId]) d[guildId][userId] = [];
    d[guildId][userId].push({ reason: reason || 'Aucune', by, at: Date.now() });
    save(d);
    return d[guildId][userId].length;
}

function clearWarns(guildId, userId) {
    const d = load();
    if (!d[guildId] || !d[guildId][userId]) return 0;
    const n = d[guildId][userId].length;
    delete d[guildId][userId];
    if (Object.keys(d[guildId]).length === 0) delete d[guildId];
    save(d);
    return n;
}

module.exports = { getWarns, addWarn, clearWarns };
