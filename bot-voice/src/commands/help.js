const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    const p = config.prefix;
    await message.reply({
        embeds: [{
            color: 0x5865F2,
            title: '🔊 Bot Voice',
            fields: [
                { name: 'Move', value: `\`${p}move @user #channel\``, inline: true },
                { name: 'Voicemute', value: `\`${p}voicemute @user\` \`${p}voiceunmute @user\``, inline: true },
                { name: 'Deafen', value: `\`${p}deafen @user\` \`${p}undeafen @user\``, inline: true },
                { name: 'Deco', value: `\`${p}deco @user\``, inline: true },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
}};
