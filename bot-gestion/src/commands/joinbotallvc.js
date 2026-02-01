const config = require('../config');
const { doJoin, writeJoinAllCommand } = require('../../../utils/joinVoice');

const ids = () => (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

module.exports = {
    data: { name: 'joinbotallvc' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!ids().includes(message.author.id)) return message.reply('❌ Permission requise.');
        let channelId = message.mentions.channels.first()?.id;
        if (!channelId) channelId = args[0]?.replace(/[^\d]/g, '');
        if (!channelId && message.member?.voice?.channel) channelId = message.member.voice.channel.id;
        if (!channelId || channelId.length < 17) return message.reply(`❌ Utilisation: \`${config.prefix}joinbotallvc #vocal\`, \`${config.prefix}joinbotallvc <id>\`, ou rejoins un vocal et lance la commande sans arg.`);

        const guildId = message.guild.id;
        writeJoinAllCommand(channelId, guildId);
        const { ok, err } = await doJoin(message.client, channelId, guildId);
        if (ok) return message.reply('✅ Signal envoyé. Ce bot a rejoint le vocal. Les autres bots vont le rejoindre dans quelques secondes.');
        await message.reply(`❌ Channel introuvable ou inaccessible.${err ? ` (${err})` : ''}`);
    },
};
