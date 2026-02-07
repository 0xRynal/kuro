const config = require('../config');
const { canUse } = require('../utils/perms');
const { getWarns } = require('../utils/warns');

module.exports = { data: { name: 'sanctions' }, async execute(message, args) {
    if (!message.guild) return;
    if (!canUse(message.member, 'sanctions')) return message.reply('❌ Tu n\'as pas les droits.');
    const target = message.mentions.members?.first() || (args[0]?.match(/^\d{17,19}$/) ? await message.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return message.reply(`❌ Utilisation: \`${config.prefix}sanctions @user|ID\``);
    const warns = getWarns(message.guild.id, target.id);
    if (!warns.length) return message.reply(`📋 ${target} n'a aucun warn.`);

    const lines = warns.map((w, i) => `**${i + 1}.** ${w.reason} — par ${w.by}`);
    const txt = lines.join('\n').slice(0, 1900);
    await message.reply({ embeds: [{ color: 0xFFA500, title: `⚠️ Warns de ${target.user.tag} (${warns.length})`, description: txt, timestamp: new Date().toISOString() }] });
}};
