const guildConfig = require('./utils/guildConfig');

const env = {
    gamesChannelId: process.env.GAMES_CHANNEL_ID || '',
    logChannelId: process.env.LOG_CHANNEL_ID || '1458983245138890752',
    punitionsChannelId: process.env.PUNITIONS_CHANNEL_ID || '1460802671647784961',
    highRankRoleId: process.env.HIGH_RANK_ROLE_ID || '1456742024689619066',
    fullPermissionUserIds: (process.env.FULL_PERM_IDS || '685552160594723015').split(',').map(s => s.trim()).filter(Boolean),
};

function getConfig(guildId) {
    if (!guildId) return env;
    const g = guildConfig.getAll(guildId);
    const fp = g.fullPermissionUserIds;
    return {
        gamesChannelId: g.gamesChannelId ?? env.gamesChannelId,
        logChannelId: g.logChannelId ?? env.logChannelId,
        punitionsChannelId: g.punitionsChannelId ?? env.punitionsChannelId,
        highRankRoleId: g.highRankRoleId ?? env.highRankRoleId,
        fullPermissionUserIds: Array.isArray(fp) ? fp : (fp ? String(fp).split(',').map(s => s.trim()).filter(Boolean) : env.fullPermissionUserIds),
    };
}

module.exports = {
    token: process.env.TOKEN_MINIJEU || process.env.TOKEN || '',
    prefix: '!j',
    muteRoleName: 'Muted',
    maxMuteDuration: 60 * 60 * 1000,
    maxTimeoutDuration: 10 * 60 * 1000,
    getConfig,
};
