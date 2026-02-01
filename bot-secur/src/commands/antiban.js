const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { get, set, addToList, removeFromList } = require('../utils/store');

module.exports = { data: { name: 'antiban' }, async execute(message, args) {
    if (!message.guild) return;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Admin uniquement.');
    const gid = message.guild.id;
    const g = get(gid);
    const sub = args[0]?.toLowerCase();
    if (sub === 'on') { set(gid, 'antiban', true); return message.reply('✅ Antiban activé.'); }
    if (sub === 'off') { set(gid, 'antiban', false); return message.reply('✅ Antiban désactivé.'); }
    if (sub === 'protect' && args[1]) {
        const id = message.mentions.users.first()?.id || String(args[1]).replace(/\D/g, '');
        if (!id) return message.reply(`❌ Utilisation: \`${config.prefix}antiban protect @user|ID\``);
        if (addToList(gid, 'protectedUsers', id)) return message.reply(`✅ ${id} protégé.`);
        return message.reply('❌ Déjà protégé.');
    }
    if (sub === 'unprotect' && args[1]) {
        const id = message.mentions.users.first()?.id || String(args[1]).replace(/\D/g, '');
        if (!id || id.length < 17) return message.reply(`❌ \`${config.prefix}antiban unprotect @user|ID\``);
        if (removeFromList(gid, 'protectedUsers', id)) return message.reply(`✅ ${id} retiré.`);
        return message.reply('❌ Pas dans la liste.');
    }
    const on = get(gid).antiban;
    return message.reply(`🛡️ Antiban: **${on ? 'ON' : 'OFF'}** | Protégés: ${get(gid).protectedUsers.length}`);
}};
