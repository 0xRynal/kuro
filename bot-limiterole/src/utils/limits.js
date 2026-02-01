const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', '..', 'data');
const dataPath = path.join(dataDir, 'limits.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function load(guildId) {
    if (!fs.existsSync(dataPath)) return {};
    try {
        const j = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        return j[guildId] || {};
    } catch { return {}; }
}

function save(guildId, data) {
    let all = {};
    if (fs.existsSync(dataPath)) {
        try { all = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch { }
    }
    all[guildId] = data;
    fs.writeFileSync(dataPath, JSON.stringify(all, null, 2), 'utf8');
}

function setLimit(guildId, roleId, max) {
    const d = load(guildId);
    d[roleId] = Math.max(1, parseInt(max, 10) || 1);
    save(guildId, d);
    return d[roleId];
}

function removeLimit(guildId, roleId) {
    const d = load(guildId);
    delete d[roleId];
    save(guildId, d);
    return true;
}

function getLimit(guildId, roleId) {
    const d = load(guildId);
    return d[roleId] ?? null;
}

module.exports = { load, save, setLimit, removeLimit, getLimit };
