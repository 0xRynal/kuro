const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = { data: { name: 'move' }, async execute(message, args) {
    if (!message.guild) return;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
    const target = message.mentions.members?.first();
    const raw = args[1];
    const id = raw?.replace(/<#(\d+)>/, '$1') || raw;
    const ch = message.guild.channels.cache.get(id) || message.guild.channels.cache.find(c => c.isVoiceBased() && (c.name === raw || c.id === id));
    if (!target || !ch) return message.reply(`❌ Utilisation: \`${config.prefix}move @user #channel\``);
    if (!ch.isVoiceBased()) return message.reply('❌ Channel vocal requis.');
    if (!target.voice?.channel) return message.reply(`❌ ${target} n'est pas en vocal.`);

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.MoveMembers) || !me.permissions.has(PermissionFlagsBits.Connect)) return message.reply('❌ Permissions manquantes.');

    await target.voice.setChannel(ch);
    await message.reply(`✅ ${target} déplacé dans ${ch}.`);
}};
