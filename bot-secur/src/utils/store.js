const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'secur.json');

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
    const g = d[guildId] || {};
    return {
        antiban: g.antiban !== false,
        antibot: g.antibot !== false,
        antirole: g.antirole !== false,
        antichannel: g.antichannel !== false,
        protectedUsers: g.protectedUsers || [],
        allowedBanners: g.allowedBanners || [],
        botWhitelist: g.botWhitelist || [],
        roleBlacklist: g.roleBlacklist || [],
        antichannelWlUsers: g.antichannelWlUsers || [],
        antichannelWlRoles: g.antichannelWlRoles || [],
    };
}

function set(guildId, key, val) {
    const d = load();
    if (!d[guildId]) d[guildId] = {};
    d[guildId][key] = val;
    save(d);
}

function addToList(guildId, listName, id) {
    const d = load();
    if (!d[guildId]) d[guildId] = {};
    const arr = d[guildId][listName] || [];
    if (arr.includes(id)) return false;
    arr.push(id);
    d[guildId][listName] = arr;
    save(d);
    return true;
}

function removeFromList(guildId, listName, id) {
    const d = load();
    if (!d[guildId]) return false;
    const arr = d[guildId][listName] || [];
    const i = arr.indexOf(id);
    if (i === -1) return false;
    arr.splice(i, 1);
    d[guildId][listName] = arr;
    save(d);
    return true;
}

module.exports = { get, set, addToList, removeFromList };
