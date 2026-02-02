const guildConfig = require('./utils/guildConfig');

const envLog = process.env.LOG_CHANNEL_ID || '';

function getLogChannelId(guildId) {
    if (!guildId) return envLog;
    return guildConfig.get(guildId, 'logChannelId') ?? envLog;
}

module.exports = {
    token: process.env.TOKEN_BL || process.env.TOKEN || '',
    prefix: '?',
    getLogChannelId,
};
