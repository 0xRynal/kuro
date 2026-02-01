const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'blr.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function load() {
    if (!fs.existsSync(file)) return {};
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function save(d) {
    fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
}

function get(guildId) {
    const d = load();
    return d[guildId] || [];
}

function addRole(guildId, roleId) {
    const d = load();
    if (!d[guildId]) d[guildId] = [];
    if (d[guildId].includes(roleId)) return false;
    d[guildId].push(roleId);
    save(d);
    return true;
}

function removeRole(guildId, roleId) {
    const d = load();
    if (!d[guildId]) return false;
    const i = d[guildId].indexOf(roleId);
    if (i === -1) return false;
    d[guildId].splice(i, 1);
    save(d);
    return true;
}

function has(guildId, roleId) {
    return get(guildId).includes(roleId);
}

module.exports = { get, add: addRole, remove: removeRole, has };
