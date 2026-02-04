const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'blr.json');
const POWER_PERMS = [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.ModerateMembers,
];

function loadGestionRolePerms(guildId) {
    try {
        const cfgPath = path.join(__dirname, '..', '..', '..', 'bot-gestion', 'data', 'gestion_config.json');
        if (!fs.existsSync(cfgPath)) return [];
        const d = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        const rp = d.guilds?.[guildId]?.rolePerms;
        if (!rp || typeof rp !== 'object') return [];
        const ids = new Set();
        for (const arr of Object.values(rp)) {
            for (const id of arr) ids.add(id);
        }
        return [...ids];
    } catch {
        return [];
    }
}

function getRolesWithPerms(guild) {
    const ids = new Set();
    for (const [_, role] of guild.roles.cache) {
        if (role.id === guild.id) continue;
        for (const perm of POWER_PERMS) {
            if (role.permissions.has(perm)) {
                ids.add(role.id);
                break;
            }
        }
    }
    const gestionRoles = loadGestionRolePerms(guild.id);
    gestionRoles.forEach(id => ids.add(id));
    return [...ids];
}

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

function addUser(guildId, userId) {
    const d = load();
    if (!d[guildId]) d[guildId] = [];
    if (d[guildId].includes(userId)) return false;
    d[guildId].push(userId);
    save(d);
    return true;
}

function removeUser(guildId, userId) {
    const d = load();
    if (!d[guildId]) return false;
    const i = d[guildId].indexOf(userId);
    if (i === -1) return false;
    d[guildId].splice(i, 1);
    save(d);
    return true;
}

function isBlacklisted(guildId, userId) {
    return get(guildId).includes(userId);
}

module.exports = { get, addUser, removeUser, isBlacklisted, getRolesWithPerms };
