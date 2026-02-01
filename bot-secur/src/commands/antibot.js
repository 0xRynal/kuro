const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { get, set, addToList, removeFromList } = require('../utils/store');

module.exports = { data: { name: 'antibot' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin uniquement.');
    const gid = message.guild.id;
    const g = get(gid);
    const sub = args[0]?.toLowerCase();
    if (sub === 'on') { set(gid, 'antibot', true); return message.reply('✅ Antibot activé.'); }
    if (sub === 'off') { set(gid, 'antibot', false); return message.reply('✅ Antibot désactivé.'); }
    if (sub === 'wl' && args[1]) {
        const id = message.mentions.users.first()?.id || String(args[1]).replace(/\D/g, '');
        if (!id) return message.reply(`❌ Utilisation: \`${config.prefix}antibot wl @bot|ID\``);
        if (addToList(gid, 'botWhitelist', id)) return message.reply(`✅ ${id} en whitelist.`);
        return message.reply('❌ Déjà en whitelist.');
    }
    if (sub === 'unwl' && args[1]) {
        const id = message.mentions.users.first()?.id || String(args[1]).replace(/\D/g, '');
        if (!id || id.length < 17) return message.reply(`❌ \`${config.prefix}antibot unwl @bot|ID\``);
        if (removeFromList(gid, 'botWhitelist', id)) return message.reply(`✅ ${id} retiré.`);
        return message.reply('❌ Pas en whitelist.');
    }
    const on = get(gid).antibot;
    return message.reply(`🛡️ Antibot: **${on ? 'ON' : 'OFF'}** | Whitelist: ${get(gid).botWhitelist.length}`);
}};
