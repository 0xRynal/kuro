const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = { data: { name: 'voiceunmute' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.MuteMembers)) return message.reply('❌ Tu dois avoir la permission Couper le micro.');
    const target = message.mentions.members?.first();
    if (!target) return message.reply(`❌ Utilisation: \`${config.prefix}voiceunmute @user\``);
    if (!target.voice?.channel) return message.reply(`❌ ${target} n'est pas en vocal.`);

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.MuteMembers) || me.roles.highest.position <= target.roles.highest.position) return message.reply('❌ Permissions ou hiérarchie.');

    await target.voice.setMute(false);
    await message.reply(`✅ Micro rétabli pour ${target}.`);
}};
