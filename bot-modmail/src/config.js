const guildConfig = require('./utils/guildConfig');

const env = {
    guildId: process.env.MODMAIL_GUILD_ID || '',
    categoryId: process.env.MODMAIL_CATEGORY_ID || '',
    staffRoleIds: (process.env.MODMAIL_STAFF_ROLES || '').split(',').filter(Boolean),
    logChannelId: process.env.MODMAIL_LOG_CHANNEL_ID || '',
};

function getGuildId() { return guildConfig.get('guildId') || env.guildId; }
function getCategoryId() { return guildConfig.get('categoryId') || env.categoryId; }
function getStaffRoleIds() {
    const s = guildConfig.get('staffRoleIds');
    return Array.isArray(s) ? s : (s ? String(s).split(',').filter(Boolean) : env.staffRoleIds);
}
function getLogChannelId() { return guildConfig.get('logChannelId') || env.logChannelId; }

module.exports = {
    token: process.env.TOKEN_MODMAIL || process.env.TOKEN || '',
    prefix: '\\',
    get guildId() { return getGuildId(); },
    get categoryId() { return getCategoryId(); },
    get staffRoleIds() { return getStaffRoleIds(); },
    get logChannelId() { return getLogChannelId(); },
};
