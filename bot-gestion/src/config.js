const guildConfig = require('./utils/guildConfig');

const env = {
    logChannelId: process.env.LOG_CHANNEL_ID || '',
    fullPermissionUserIds: (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean),
    highRankRoleId: process.env.HIGH_RANK_ROLE_ID || '',
};

function getConfig(guildId) {
    if (!guildId) return env;
    const g = guildConfig.getAll(guildId);
    const fp = g.fullPermissionUserIds;
    const hr = g.highRankRoleId;
    return {
        logChannelId: g.logChannelId ?? env.logChannelId,
        fullPermissionUserIds: Array.isArray(fp) ? fp : (fp ? String(fp).split(',').map(s => s.trim()).filter(Boolean) : env.fullPermissionUserIds),
        highRankRoleId: hr ?? env.highRankRoleId,
    };
}

module.exports = {
    token: process.env.TOKEN_GESTION || process.env.TOKEN || '',
    prefix: '.',
    muteRoleName: 'Muted',
    maxMuteDuration: 60 * 60 * 1000,
    maxTimeoutDuration: 10 * 60 * 1000,
    getConfig,
};
