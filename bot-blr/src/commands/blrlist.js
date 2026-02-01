const { PermissionFlagsBits } = require('discord.js');
const { get } = require('../utils/blr');

module.exports = { data: { name: 'blrlist' }, async execute(message) {
    if (!message.guild) return;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
    const list = get(message.guild.id);
    if (!list.length) return message.reply('📋 Aucun rôle blacklisté (blrole).');

    const lines = list.map(rid => {
        const r = message.guild.roles.cache.get(rid);
        return `• ${r ? r.name : rid}`;
    });
    await message.reply({ embeds: [{ color: 0x2C2F33, title: '📋 BLRole', description: lines.join('\n'), timestamp: new Date().toISOString() }] });
}};
