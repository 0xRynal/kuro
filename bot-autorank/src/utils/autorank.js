const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'autorank.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function load() {
    if (!fs.existsSync(file)) return {};
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function save(d) {
    fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
}

function getCount(guildId, userId) {
    const d = load();
    const g = d[guildId] || {};
    const counts = g.messageCounts || {};
    return counts[userId] || 0;
}

function incCount(guildId, userId) {
    const d = load();
    if (!d[guildId]) d[guildId] = { messageCounts: {}, roles: [] };
    if (!d[guildId].messageCounts) d[guildId].messageCounts = {};
    const c = (d[guildId].messageCounts[userId] || 0) + 1;
    d[guildId].messageCounts[userId] = c;
    save(d);
    return c;
}

function getRoles(guildId) {
    const d = load();
    const g = d[guildId] || {};
    return g.roles || [];
}

function setRoles(guildId, roles) {
    const d = load();
    if (!d[guildId]) d[guildId] = { messageCounts: {}, roles: [] };
    d[guildId].roles = roles;
    save(d);
}

function addRoleThreshold(guildId, at, roleId) {
    const roles = getRoles(guildId);
    const i = roles.findIndex(r => r.at === at);
    if (i >= 0) roles[i].roleId = roleId;
    else roles.push({ at: Number(at), roleId });
    roles.sort((a, b) => a.at - b.at);
    setRoles(guildId, roles);
}

function removeRoleThreshold(guildId, at) {
    let roles = getRoles(guildId);
    roles = roles.filter(r => r.at !== Number(at));
    setRoles(guildId, roles);
}

module.exports = { load, getCount, incCount, getRoles, setRoles, addRoleThreshold, removeRoleThreshold };
