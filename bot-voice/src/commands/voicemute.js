const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = { data: { name: 'voicemute' }, async execute(message, args) {
    if (!message.guild) return;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
    const target = message.mentions.members?.first();
    if (!target) return message.reply(`❌ Utilisation: \`${config.prefix}voicemute @user\``);
    if (!target.voice?.channel) return message.reply(`❌ ${target} n'est pas en vocal.`);

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.MuteMembers) || me.roles.highest.position <= target.roles.highest.position) return message.reply('❌ Permissions ou hiérarchie.');

    await target.voice.setMute(true);
    await message.reply(`✅ Micro coupé pour ${target}.`);
}};
