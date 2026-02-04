const { get } = require('../utils/blr');

module.exports = {
    data: { name: 'blrlist' },
    async execute(message) {
        if (!message.guild) return;
        const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
        const list = get(message.guild.id);
        if (!list.length) return message.reply('📋 Aucun utilisateur blacklisté (blrole).');
        const lines = [];
        for (const uid of list.slice(0, 25)) {
            try {
                const u = await message.client.users.fetch(uid);
                lines.push(`• ${u.tag} (\`${uid}\`)`);
            } catch {
                lines.push(`• \`${uid}\``);
            }
        }
        if (list.length > 25) lines.push(`... et ${list.length - 25} autre(s)`);
        await message.reply({ embeds: [{ color: 0x2C2F33, title: '📋 BLRole (users blacklistés)', description: lines.join('\n'), timestamp: new Date().toISOString() }] });
    },
};
