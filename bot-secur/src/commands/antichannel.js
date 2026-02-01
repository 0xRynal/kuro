const { PermissionFlagsBits } = require('discord.js');
const { get, set, addToList, removeFromList } = require('../utils/store');

module.exports = { data: { name: 'antichannel' }, async execute(message, args) {
    if (!message.guild) return;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Admin uniquement.');
    const config = require('../config');
    const p = config.prefix;
    const gid = message.guild.id;
    const g = get(gid);
    const sub = args[0]?.toLowerCase();

    if (sub === 'on') { set(gid, 'antichannel', true); return message.reply('✅ Antichannel activé.'); }
    if (sub === 'off') { set(gid, 'antichannel', false); return message.reply('✅ Antichannel désactivé.'); }

    if (sub === 'wl' || sub === 'add') {
        const target = args[1];
        if (!target) return message.reply(`Usage: \`${p}antichannel wl @user|@role|ID\``);
        const uid = message.mentions.users.first()?.id;
        const rid = message.mentions.roles.first()?.id;
        const rawId = String(target).replace(/\D/g, '');
        if (uid) {
            if (addToList(gid, 'antichannelWlUsers', uid)) return message.reply(`✅ <@${uid}> autorisé à créer des channels.`);
            return message.reply('❌ Déjà dans la WL.');
        }
        if (rid) {
            if (addToList(gid, 'antichannelWlRoles', rid)) return message.reply(`✅ <@&${rid}> autorisé.`);
            return message.reply('❌ Déjà dans la WL.');
        }
        if (rawId.length >= 17) {
            const isRole = message.guild.roles.cache.has(rawId);
            const list = isRole ? 'antichannelWlRoles' : 'antichannelWlUsers';
            if (addToList(gid, list, rawId)) return message.reply(`✅ ${isRole ? `<@&${rawId}>` : `\`${rawId}\``} autorisé.`);
            return message.reply('❌ Déjà dans la WL.');
        }
        return message.reply(`Usage: \`${p}antichannel wl @user|@role|ID\``);
    }

    if (sub === 'unwl' || sub === 'remove') {
        const target = args[1];
        if (!target) return message.reply(`Usage: \`${p}antichannel unwl @user|@role|ID\``);
        const uid = message.mentions.users.first()?.id;
        const rid = message.mentions.roles.first()?.id;
        const rawId = String(target).replace(/\D/g, '');
        if (uid && removeFromList(gid, 'antichannelWlUsers', uid)) return message.reply(`✅ <@${uid}> retiré.`);
        if (rid && removeFromList(gid, 'antichannelWlRoles', rid)) return message.reply(`✅ <@&${rid}> retiré.`);
        if (rawId.length >= 17) {
            const isRole = message.guild.roles.cache.has(rawId);
            const list = isRole ? 'antichannelWlRoles' : 'antichannelWlUsers';
            if (removeFromList(gid, list, rawId)) return message.reply(`✅ ${isRole ? `<@&${rawId}>` : rawId} retiré.`);
        }
        return message.reply('❌ Pas dans la WL.');
    }

    if (sub === 'list') {
        const users = g.antichannelWlUsers || [];
        const roles = g.antichannelWlRoles || [];
        const uStr = users.length ? users.map(id => `<@${id}>`).join(', ') : '(aucun)';
        const rStr = roles.length ? roles.map(id => `<@&${id}>`).join(', ') : '(aucun)';
        return message.reply({ embeds: [{ color: 0xED4245, title: '🛡️ Antichannel WL', fields: [{ name: 'Users', value: uStr }, { name: 'Rôles', value: rStr }], timestamp: new Date().toISOString() }] });
    }

    const on = g.antichannel;
    return message.reply(`🛡️ Antichannel: **${on ? 'ON' : 'OFF'}** | \`${p}antichannel wl|unwl|list @user|@role|ID\``);
}};
