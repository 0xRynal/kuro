const guildConfig = require('./guildConfig');

const VALID_PERMS = ['mute', 'unmute', 'timeout', 'untimeout', 'ban', 'unban', 'warn', 'sanctions',
    'addrole', 'rrole', 'lock', 'unlock', 'slowmode', 'rename', 'wladd', 'wlremove', 'wllist',
    'semiwladd', 'semiwlremove', 'semiwllist', 'renew', 'unwarn'];

function getRolePerms(guildId) {
    const p = guildConfig.get(guildId, 'rolePerms');
    return p && typeof p === 'object' ? p : {};
}

function saveRolePerms(guildId, data) {
    guildConfig.set(guildId, 'rolePerms', data);
}

function addRolePerm(guildId, roleId, permName) {
    const perm = permName.toLowerCase();
    if (!VALID_PERMS.includes(perm)) return false;
    const data = getRolePerms(guildId);
    if (!data[perm]) data[perm] = [];
    if (data[perm].includes(roleId)) return true;
    data[perm].push(roleId);
    saveRolePerms(guildId, data);
    return true;
}

function removeRolePerm(guildId, roleId, permName) {
    const perm = permName.toLowerCase();
    if (!VALID_PERMS.includes(perm)) return false;
    const data = getRolePerms(guildId);
    if (!data[perm]) return true;
    const i = data[perm].indexOf(roleId);
    if (i !== -1) {
        data[perm].splice(i, 1);
        if (data[perm].length === 0) delete data[perm];
        saveRolePerms(guildId, data);
    }
    return true;
}

function removeRoleFromAllPerms(guildId, roleId) {
    const data = getRolePerms(guildId);
    let removed = [];
    for (const perm of Object.keys(data)) {
        const i = data[perm].indexOf(roleId);
        if (i !== -1) {
            data[perm].splice(i, 1);
            removed.push(perm);
            if (data[perm].length === 0) delete data[perm];
        }
    }
    if (removed.length) saveRolePerms(guildId, data);
    return removed;
}

function hasRolePerm(member, permName) {
    if (!member?.guild) return false;
    const data = getRolePerms(member.guild.id);
    const perm = permName.toLowerCase();
    const roleIds = data[perm];
    if (!roleIds?.length) return false;
    return member.roles.cache.some(r => roleIds.includes(r.id));
}

module.exports = { getRolePerms, addRolePerm, removeRolePerm, removeRoleFromAllPerms, hasRolePerm, VALID_PERMS };
