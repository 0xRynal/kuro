const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { canUse, full, canSanction, punitionsChannelOnly } = require('../utils/perms');
const { getWarns, addWarn } = require('../utils/warns');

module.exports = { data: { name: 'warn' }, async execute(message, args) {
    if (!message.guild) return;
    if (!canUse(message.member, 'warn')) return message.reply('❌ Tu n\'as pas les droits.');
    const target = message.mentions.members?.first() || (args[0]?.match(/^\d{17,19}$/) ? await message.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return message.reply(`❌ Utilisation: \`${config.prefix}warn @user|ID [raison]\``);
    if (target.id === message.author.id) return message.reply('❌ Pas de self-warn.');
    if (target.id === message.client.user.id) return message.reply('❌ Non.');
    if (!full(message.author.id) && !canSanction(message.member, target)) return message.reply('❌ Hiérarchie.');
    const reason = args.slice(1).join(' ') || 'Aucune';
    const n = addWarn(message.guild.id, target.id, reason, message.author.tag);
    await message.reply(`✅ ${target} averti (${n} warn(s)). Raison: ${reason}`);

    const logChId = config.getConfig(message.guild.id).logChannelId;
    if (logChId) {
        const ch = message.guild.channels.cache.get(logChId);
        if (ch) ch.send({ embeds: [{ color: 0xFFA500, title: '⚠️ Warn', fields: [
            { name: 'Utilisateur', value: `${target} (${target.user.tag})`, inline: true },
            { name: 'Par', value: `${message.author} (${message.author.tag})`, inline: true },
            { name: 'Raison', value: reason, inline: false },
            { name: 'Total warns', value: String(n), inline: true },
        ], timestamp: new Date().toISOString() }] }).catch(() => {});
    }
}};
