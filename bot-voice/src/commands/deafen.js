const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = { data: { name: 'deafen' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.DeafenMembers)) return message.reply('❌ Tu dois avoir la permission Couper les écouteurs.');
    const target = message.mentions.members?.first();
    if (!target) return message.reply(`❌ Utilisation: \`${config.prefix}deafen @user\``);
    if (!target.voice?.channel) return message.reply(`❌ ${target} n'est pas en vocal.`);

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionFlagsBits.DeafenMembers) || me.roles.highest.position <= target.roles.highest.position) return message.reply('❌ Permissions ou hiérarchie.');

    await target.voice.setDeaf(true);
    await message.reply(`✅ Casque coupé pour ${target}.`);
}};
