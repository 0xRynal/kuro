const config = require('../config');
const { canUse } = require('../utils/perms');
const { getWarns } = require('../utils/warns');

module.exports = {
    data: { name: 'warnlist' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!canUse(message.member, 'warnlist')) return message.reply('❌ Tu n\'as pas les droits.');
        const raw = args[0];
        if (!raw) return message.reply(`❌ Usage: \`${config.prefix}warnlist <userID>\``);
        const userId = raw.replace(/\D/g, '');
        if (!userId || userId.length < 17) return message.reply('❌ ID utilisateur invalide.');
        const warns = getWarns(message.guild.id, userId);
        if (!warns.length) return message.reply(`📋 Aucun warn pour l'ID \`${userId}\`.`);
        let userTag = userId;
        try {
            const u = await message.client.users.fetch(userId);
            userTag = u.tag;
        } catch {}
        const lines = warns.map((w, i) => `**${i + 1}.** ${w.reason} — par ${w.by} — <t:${Math.floor(w.at / 1000)}:R>`);
        const txt = lines.join('\n').slice(0, 1900);
        await message.reply({
            embeds: [{
                color: 0xFFA500,
                title: `⚠️ Warns de ${userTag} (${warns.length})`,
                description: txt,
                timestamp: new Date().toISOString(),
            }],
        });
    },
};
