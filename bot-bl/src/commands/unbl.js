const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { getIds, hasLevel, getEntry, remove } = require('../utils/bl');

module.exports = { data: { name: 'unbl' }, async execute(message, args) {
    if (!message.guild) return;
    if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('❌ Gérer les bannissements requis.');
    if (!args[0]) return message.reply(`❌ \`${config.prefix}unbl @user|ID <1|2|3>\`\nEx: \`${config.prefix}unbl 123456789012345678 3\``);

    const target = message.mentions.users.first() || (args[0] && /^\d{17,19}$/.test(args[0]) ? { id: args[0] } : null);
    const userId = String(target?.id || args[0].replace(/\D/g, ''));
    const gid = message.guild.id;

    if (!userId || userId.length < 17) return message.reply('❌ User ou ID invalide.');
    if (!getIds(gid).includes(userId)) return message.reply('❌ Pas dans la blacklist.');

    const levelArg = args[1];
    const level = levelArg ? parseInt(levelArg, 10) : null;

    if (!level || ![1, 2, 3].includes(level)) {
        const entry = getEntry(gid, userId);
        const levels = entry?.levels?.map(l => l.level) || [];
        return message.reply(`❌ Niveau requis: 1, 2 ou 3\nUser blacklisté pour: ${levels.length ? levels.join(', ') : '?'}\nEx: \`${config.prefix}unbl @user 3\` pour retirer uniquement le niv.3`);
    }

    if (!hasLevel(gid, userId, level)) return message.reply(`❌ Pas blacklisté pour le niveau ${level}.`);

    remove(gid, userId, level);

    const stillBl = getIds(gid).includes(userId);
    try {
        if (!stillBl && message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            await message.guild.members.unban(userId, `Unbl niv.${level} par ${message.author.tag}`);
            return message.reply(`✅ Niv.${level} retiré. User complètement unbl et débanni.`);
        }
        return message.reply(`✅ Niv.${level} retiré.${stillBl ? ' (Toujours BL pour autre(s) niveau(x))' : ''}`);
    } catch {
        return message.reply(`✅ Niv.${level} retiré.${stillBl ? ' (Toujours BL pour autre(s) niveau(x))' : ''}`);
    }
}};
