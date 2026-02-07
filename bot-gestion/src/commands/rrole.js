const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { canUse, full, canSanction } = require('../utils/perms');

module.exports = { data: { name: 'rrole' }, async execute(message, args) {
    if (!message.guild) return;
    if (!canUse(message.member, 'rrole')) return message.reply('❌ Tu n\'as pas les droits.');
    const target = message.mentions.members?.first() || (args[0]?.match(/^\d{17,19}$/) ? await message.guild.members.fetch(args[0]).catch(() => null) : null);
    const roleId = args[1]?.replace(/\D/g, '') || message.mentions.roles?.first()?.id;
    const role = message.mentions.roles?.first() || (roleId ? message.guild.roles.cache.get(roleId) || await message.guild.roles.fetch(roleId).catch(() => null) : null);
    if (!target || !role) return message.reply(`❌ Utilisation: \`${config.prefix}rrole @user|ID @role|ID\``);
    if (!full(message.author.id) && !canSanction(message.member, target)) return message.reply('❌ Hiérarchie.');
    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ Je n\'ai pas la permission Gérer les rôles.');
    if (role.position >= message.guild.members.me.roles.highest.position) return message.reply('❌ Ce rôle est au-dessus du mien.');
    if (!target.roles.cache.has(role.id)) return message.reply(`❌ ${target} n'a pas le rôle ${role}.`);

    await target.roles.remove(role);
    await message.reply(`✅ Rôle ${role} retiré à ${target}.`);

    const logChId = config.getConfig(message.guild.id).logChannelId;
    if (logChId) {
        const ch = message.guild.channels.cache.get(logChId);
        if (ch) ch.send({ embeds: [{ color: 0x5865F2, title: '➖ Rrole', fields: [
            { name: 'Utilisateur', value: `${target} (${target.user.tag})`, inline: true },
            { name: 'Rôle', value: `${role.name}`, inline: true },
            { name: 'Par', value: `${message.author.tag}`, inline: true },
        ], timestamp: new Date().toISOString() }] }).catch(() => {});
    }
}};
