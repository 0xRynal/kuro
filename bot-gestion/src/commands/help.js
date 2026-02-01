const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    if (!message.guild) return;
    const p = config.prefix;
    await message.reply({
        embeds: [{
            color: 0x5865F2,
            title: '📋 Bot Gestion',
            fields: [
                { name: 'Sanctions', value: `\`${p}mute\` \`${p}unmute\` \`${p}timeout\` \`${p}untimeout\` \`${p}ban\` \`${p}unban\``, inline: false },
                { name: 'Warn', value: `\`${p}warn @user [raison]\` \`${p}sanctions @user\``, inline: false },
                { name: 'Rôles', value: `\`${p}addrole @user @role\` \`${p}rrole @user @role\``, inline: false },
                { name: 'Channels', value: `\`${p}lock\` \`${p}unlock\` \`${p}clear\` \`${p}slowmode <sec> <durée>\``, inline: false },
                { name: 'Whitelist', value: `\`${p}wladd @role\` \`${p}wlremove @role\` \`${p}wllist\``, inline: false },
                { name: 'Semi-WL', value: `\`${p}semiwladd @role\` \`${p}semiwlremove @role\` \`${p}semiwllist\``, inline: false },
                { name: 'Admin', value: `\`${p}setadmin @role\` \`${p}leave\` \`${p}renew\` \`${p}rulesmessage\` \`${p}joinbotallvc <channelId>\``, inline: false },
                { name: 'Config', value: `\`${p}set <log|fullperm|highrank> <id>\``, inline: false },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
}};
