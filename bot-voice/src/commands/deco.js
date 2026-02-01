const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = { data: { name: 'deco' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.MoveMembers)) return message.reply('❌ Tu dois avoir la permission Déplacer des membres.');
    const target = message.mentions.members?.first();
    if (!target) return message.reply(`❌ Utilisation: \`${config.prefix}deco @user\``);
    if (!target.voice?.channel) return message.reply(`❌ ${target} n'est pas en vocal.`);

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.MoveMembers) || me.roles.highest.position <= target.roles.highest.position) return message.reply('❌ Permissions ou hiérarchie.');

    await target.voice.disconnect();
    await message.reply(`✅ ${target} déconnecté du vocal.`);
}};
