const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

function full(userId, guildId) {
    const cfg = config.getConfig(guildId);
    return cfg.fullPermissionUserIds?.includes(userId);
}

function staff(member) {
    if (!member) return false;
    if (full(member.id, member.guild?.id)) return true;
    const { hasWhitelistedRole, hasSemiWhitelistedRole, hasAdminRole } = require('./whitelist');
    if (hasWhitelistedRole(member) || hasSemiWhitelistedRole(member) || hasAdminRole(member)) return true;
    return false;
}

function canSanction(executor, target) {
    if (!target?.guild) return true;
    const gid = executor.guild?.id || target.guild?.id;
    if (full(executor.id, gid)) return true;
    if (executor.id === executor.guild?.ownerId) return true;
    const { hasWhitelistedRole } = require('./whitelist');
    if (hasWhitelistedRole(target)) return false;
    if (!target.roles?.highest) return true;
    return executor.roles.highest.position > target.roles.highest.position;
}

function punitionsChannelOnly() { return false; }

module.exports = { full, staff, canSanction, punitionsChannelOnly };
