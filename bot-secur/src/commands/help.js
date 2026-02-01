const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    const p = config.prefix;
    await message.reply({
        embeds: [{
            color: 0xED4245,
            title: '🛡️ Bot Sécur',
            fields: [
                { name: 'Antiban', value: `\`${p}antiban on|off\` \`${p}antiban protect|unprotect @user|ID\``, inline: false },
                { name: 'Antibot', value: `\`${p}antibot on|off\` \`${p}antibot wl|unwl @bot|ID\``, inline: false },
                { name: 'Antirole', value: `\`${p}antirole on|off\` \`${p}antirole add|remove @role\``, inline: false },
                { name: 'Antichannel', value: `\`${p}antichannel on|off\` \`${p}antichannel wl|unwl|list @user|@role\``, inline: false },
                { name: 'Config', value: `\`${p}set log <channelId>\` (admin)`, inline: false },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
}};
