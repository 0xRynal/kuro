const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'minijeu_config.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function load() {
    if (!fs.existsSync(file)) return { guilds: {} };
    try {
        const d = JSON.parse(fs.readFileSync(file, 'utf8'));
        return { guilds: d.guilds || {} };
    } catch { return { guilds: {} }; }
}

function save(d) {
    fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
}

function get(guildId, key) {
    const d = load();
    return d.guilds[guildId]?.[key];
}

function set(guildId, key, value) {
    const d = load();
    if (!d.guilds[guildId]) d.guilds[guildId] = {};
    d.guilds[guildId][key] = value;
    save(d);
}

function getAll(guildId) {
    const d = load();
    return d.guilds[guildId] || {};
}

module.exports = { load, get, set, getAll };
