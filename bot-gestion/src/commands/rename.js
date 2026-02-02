const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { canUse, full, canSanction } = require('../utils/perms');

module.exports = {
    data: { name: 'rename' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!canUse(message.member, 'rename')) return message.reply('❌ Tu n\'as pas les droits.');
        if (args.length < 2) return message.reply(`❌ Usage: \`${config.prefix}rename @user <nouveau pseudo>\``);
        const target = message.mentions.members?.first() || (args[0].match(/^\d{17,19}$/) ? await message.guild.members.fetch(args[0]).catch(() => null) : null);
        if (!target) return message.reply('❌ Utilisateur introuvable.');
        const newName = args.slice(1).join(' ').trim();
        if (!newName || newName.length > 32) return message.reply('❌ Pseudo invalide (max 32 car.).');
        if (target.id === message.author.id) return message.reply('❌ Utilise les paramètres Discord pour te renommer.');
        if (target.id === message.client.user.id) return message.reply('❌ Non.');
        if (!full(message.author.id) && !canSanction(message.member, target)) return message.reply('❌ Hiérarchie.');
        try {
            if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return message.reply('❌ Je n\'ai pas la permission de gérer les pseudos.');
            }
            await target.setNickname(newName, `Renommé par ${message.author.tag}`);
            await message.reply(`✅ ${target} renommé: **${newName}**`);
        } catch (e) {
            await message.reply('❌ Erreur (hiérarchie ou permissions manquantes).');
        }
    },
};
