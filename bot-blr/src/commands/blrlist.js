const { PermissionFlagsBits } = require('discord.js');
const { get } = require('../utils/blr');

module.exports = { data: { name: 'blrlist' }, async execute(message) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ Gérer les rôles requis.');
    const list = get(message.guild.id);
    if (!list.length) return message.reply('📋 Aucun rôle blacklisté (blrole).');

    const lines = list.map(rid => {
        const r = message.guild.roles.cache.get(rid);
        return `• ${r ? r.name : rid}`;
    });
    await message.reply({ embeds: [{ color: 0x2C2F33, title: '📋 BLRole', description: lines.join('\n'), timestamp: new Date().toISOString() }] });
}};
