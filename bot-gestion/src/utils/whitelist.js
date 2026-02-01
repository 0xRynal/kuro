const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', '..', 'data');
const whitelistPath = path.join(dataDir, 'whitelist.json');
const semiWhitelistPath = path.join(dataDir, 'semiwhitelist.json');
const adminRolePath = path.join(dataDir, 'adminrole.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function loadWhitelist(guildId) {
    if (!fs.existsSync(whitelistPath)) return [];
    try {
        const data = fs.readFileSync(whitelistPath, 'utf8');
        return JSON.parse(data)[guildId] || [];
    } catch { return []; }
}

function saveWhitelist(guildId, roles) {
    let d = {};
    if (fs.existsSync(whitelistPath)) try { d = JSON.parse(fs.readFileSync(whitelistPath, 'utf8')); } catch {}
    d[guildId] = roles;
    fs.writeFileSync(whitelistPath, JSON.stringify(d, null, 2), 'utf8');
}

function addRole(guildId, roleId) {
    const roles = loadWhitelist(guildId);
    if (roles.includes(roleId)) return false;
    roles.push(roleId);
    saveWhitelist(guildId, roles);
    return true;
}

function removeRole(guildId, roleId) {
    const roles = loadWhitelist(guildId);
    const i = roles.indexOf(roleId);
    if (i === -1) return false;
    roles.splice(i, 1);
    saveWhitelist(guildId, roles);
    return true;
}

function isRoleWhitelisted(guildId, roleId) { return loadWhitelist(guildId).includes(roleId); }

function hasWhitelistedRole(member) {
    const wl = loadWhitelist(member.guild.id);
    return member.roles.cache.some(r => wl.includes(r.id));
}

function loadSemiWhitelist(guildId) {
    if (!fs.existsSync(semiWhitelistPath)) return [];
    try { return JSON.parse(fs.readFileSync(semiWhitelistPath, 'utf8'))[guildId] || []; } catch { return []; }
}

function saveSemiWhitelist(guildId, roles) {
    let d = {};
    if (fs.existsSync(semiWhitelistPath)) try { d = JSON.parse(fs.readFileSync(semiWhitelistPath, 'utf8')); } catch {}
    d[guildId] = roles;
    fs.writeFileSync(semiWhitelistPath, JSON.stringify(d, null, 2), 'utf8');
}

function addSemiWhitelistRole(guildId, roleId) {
    const roles = loadSemiWhitelist(guildId);
    if (roles.includes(roleId)) return false;
    roles.push(roleId);
    saveSemiWhitelist(guildId, roles);
    return true;
}

function removeSemiWhitelistRole(guildId, roleId) {
    const roles = loadSemiWhitelist(guildId);
    const i = roles.indexOf(roleId);
    if (i === -1) return false;
    roles.splice(i, 1);
    saveSemiWhitelist(guildId, roles);
    return true;
}

function isRoleSemiWhitelisted(guildId, roleId) { return loadSemiWhitelist(guildId).includes(roleId); }

function hasSemiWhitelistedRole(member) {
    const wl = loadSemiWhitelist(member.guild.id);
    return member.roles.cache.some(r => wl.includes(r.id));
}

function loadAdminRole(guildId) {
    if (!fs.existsSync(adminRolePath)) return null;
    try { return JSON.parse(fs.readFileSync(adminRolePath, 'utf8'))[guildId] || null; } catch { return null; }
}

function saveAdminRole(guildId, roleId) {
    let d = {};
    if (fs.existsSync(adminRolePath)) try { d = JSON.parse(fs.readFileSync(adminRolePath, 'utf8')); } catch {}
    d[guildId] = roleId;
    fs.writeFileSync(adminRolePath, JSON.stringify(d, null, 2), 'utf8');
}

function hasAdminRole(member) {
    const rid = loadAdminRole(member.guild.id);
    if (!rid) return false;
    const role = member.guild.roles.cache.get(rid);
    if (!role) return false;
    return member.roles.cache.has(rid) || member.roles.highest.position > role.position;
}

function hasFullPermissions(userId, guildId) {
    const config = require('../config');
    return config.getConfig(guildId).fullPermissionUserIds?.includes(userId);
}

function isHighRank(member) {
    const config = require('../config');
    const hr = config.getConfig(member.guild?.id).highRankRoleId;
    if (!hr) return false;
    const role = member.guild.roles.cache.get(hr);
    if (!role) return false;
    return member.roles.cache.has(hr) || member.roles.highest.position > role.position;
}

module.exports = {
    loadWhitelist, saveWhitelist, addRole, removeRole, isRoleWhitelisted, hasWhitelistedRole,
    loadSemiWhitelist, saveSemiWhitelist, addSemiWhitelistRole, removeSemiWhitelistRole,
    isRoleSemiWhitelisted, hasSemiWhitelistedRole,
    loadAdminRole, saveAdminRole, hasAdminRole,
    hasFullPermissions, isHighRank,
};
