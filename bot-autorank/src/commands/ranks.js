const config = require('../config');
const { getRoles, getCount } = require('../utils/autorank');

module.exports = { data: { name: 'ranks' }, async execute(message, args) {
    const target = message.mentions.members?.first() || message.member;
    const roles = getRoles(message.guild.id);
    const count = getCount(message.guild.id, target.id);

    if (!roles.length) return message.reply(`❌ Aucun seuil configuré. \`${config.prefix}setrank <messages> @role\``);

    const lines = roles.map(r => {
        const role = message.guild.roles.cache.get(r.roleId);
        const has = target.roles.cache.has(r.roleId);
        return `• **${r.at}** msg → ${role ? role.name : r.roleId} ${has ? '✅' : ''}`;
    });
    await message.reply({
        embeds: [{
            color: 0x5865F2,
            title: `📊 Ranks • ${target.user.tag}`,
            description: `Messages: **${count}**\n\n${lines.join('\n')}`,
            timestamp: new Date().toISOString(),
        }],
    });
}};
