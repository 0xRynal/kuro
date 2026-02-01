const { PermissionFlagsBits } = require('discord.js');
const { load } = require('../utils/limits');

module.exports = {
    data: { name: 'limits' },
    async execute(message) {
        const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
        const d = load(message.guild.id);
        const entries = Object.entries(d);
        if (!entries.length) return message.reply('📋 Aucune limite de rôle configurée.');
        const lines = entries.map(([rid, max]) => {
            const r = message.guild.roles.cache.get(rid);
            const count = r ? r.members.size : 0;
            return `• ${r ? r.name : rid}: **${count}/${max}**`;
        });
        return message.reply({ embeds: [{ color: 0x5865F2, title: '📋 Limites de rôles', description: lines.join('\n'), timestamp: new Date().toISOString() }] });
    },
};
