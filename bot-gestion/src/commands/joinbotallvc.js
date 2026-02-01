const config = require('../config');
const { doJoin, writeJoinAllCommand } = require('../../../utils/joinVoice');

const ids = () => (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

module.exports = {
    data: { name: 'joinbotallvc' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!ids().includes(message.author.id)) return message.reply('❌ Permission requise.');
        const channelId = args[0]?.replace(/\D/g, '') || message.mentions.channels.first()?.id;
        if (!channelId || channelId.length < 17) return message.reply(`❌ Utilisation: \`${config.prefix}joinbotallvc <channelId>\` Ex: \`${config.prefix}joinbotallvc 1467635993564676106\``);

        writeJoinAllCommand(channelId);
        const ok = await doJoin(message.client, channelId);
        await message.reply(ok ? `✅ Signal envoyé. Ce bot a rejoint le vocal. Les autres bots vont le rejoindre dans quelques secondes.` : `❌ Channel introuvable ou inaccessible.`);
    },
};
