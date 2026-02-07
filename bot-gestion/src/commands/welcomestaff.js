const config = require('../config');
const guildConfig = require('../utils/guildConfig');
const { BOT_OWNER_IDS } = require('../utils/perms');

function canSet(member) {
    if (!member) return false;
    if (BOT_OWNER_IDS.includes(member.id)) return true;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    return ids.includes(member.id);
}

module.exports = {
    data: { name: 'welcomestaff' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!canSet(message.member)) return message.reply('❌ Admin uniquement.');

        const p = config.prefix;
        const channelId = args[0]?.replace(/\D/g, '') || '';
        guildConfig.set(message.guild.id, 'welcomeStaffChannelId', channelId);
        return message.reply(channelId ? `✅ Welcome staff: <#${channelId}>` : `✅ Welcome staff désactivé. (\`${p}welcomestaff <channelId>\` pour définir)`);
    },
};
