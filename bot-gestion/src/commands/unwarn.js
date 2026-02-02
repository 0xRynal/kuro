const config = require('../config');
const { canUse, full, canSanction } = require('../utils/perms');
const { getWarns, clearWarns, removeWarnAtIndex } = require('../utils/warns');

module.exports = {
    data: { name: 'unwarn' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!canUse(message.member, 'unwarn')) return message.reply('❌ Tu n\'as pas les droits.');
        const target = message.mentions.members?.first();
        if (!target) return message.reply(`❌ Usage: \`${config.prefix}unwarn @user [index]\` (index = retirer 1 seul warn)`);
        if (!full(message.author.id) && !canSanction(message.member, target)) return message.reply('❌ Hiérarchie.');
        const warns = getWarns(message.guild.id, target.id);
        if (!warns.length) return message.reply(`📋 ${target} n'a aucun warn.`);
        const idx = args[1] ? parseInt(args[1], 10) - 1 : null;
        if (idx !== null && (isNaN(idx) || idx < 0 || idx >= warns.length)) {
            return message.reply(`❌ Index invalide (1-${warns.length}).`);
        }
        if (idx !== null) {
            removeWarnAtIndex(message.guild.id, target.id, idx);
            const rest = getWarns(message.guild.id, target.id).length;
            return message.reply(`✅ Warn #${idx + 1} retiré à ${target}. Reste ${rest} warn(s).`);
        }
        const n = clearWarns(message.guild.id, target.id);
        await message.reply(`✅ ${n} warn(s) retiré(s) à ${target}.`);
    },
};
