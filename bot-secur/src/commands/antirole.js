const { PermissionFlagsBits } = require('discord.js');
const { get, set, addToList, removeFromList } = require('../utils/store');

module.exports = { data: { name: 'antirole' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin uniquement.');
    const gid = message.guild.id;
    const sub = args[0]?.toLowerCase();
    if (sub === 'on') { set(gid, 'antirole', true); return message.reply('✅ Antirole activé.'); }
    if (sub === 'off') { set(gid, 'antirole', false); return message.reply('✅ Antirole désactivé.'); }
    const role = message.mentions.roles?.first() || message.guild.roles.cache.get(args[1]);
    if (sub === 'add' && role) {
        if (addToList(gid, 'roleBlacklist', role.id)) return message.reply(`✅ Rôle ${role.name} blacklisté.`);
        return message.reply('❌ Déjà blacklisté.');
    }
    if (sub === 'remove' && role) {
        if (removeFromList(gid, 'roleBlacklist', role.id)) return message.reply(`✅ ${role.name} retiré.`);
        return message.reply('❌ Pas blacklisté.');
    }
    const g = get(gid);
    const on = g.antirole;
    const list = g.roleBlacklist;
    const names = list.map(rid => message.guild.roles.cache.get(rid)?.name || rid).slice(0, 10).join(', ') || '—';
    return message.reply(`🛡️ Antirole: **${on ? 'ON' : 'OFF'}** | Rôles: ${names}`);
}};
