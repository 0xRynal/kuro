const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = { data: { name: 'undeafen' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.DeafenMembers)) return message.reply('❌ Tu dois avoir la permission Couper les écouteurs.');
    const target = message.mentions.members?.first();
    if (!target) return message.reply(`❌ Utilisation: \`${config.prefix}undeafen @user\``);
    if (!target.voice?.channel) return message.reply(`❌ ${target} n'est pas en vocal.`);

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.DeafenMembers) || me.roles.highest.position <= target.roles.highest.position) return message.reply('❌ Permissions ou hiérarchie.');

    await target.voice.setDeaf(false);
    await message.reply(`✅ Casque rétabli pour ${target}.`);
}};
