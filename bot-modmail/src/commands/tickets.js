const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { getOpenTickets } = require('../utils/tickets');

function isStaff(member) {
    if (!member) return false;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (ids.includes(member.id)) return true;
    if (config.staffRoleIds.length && config.staffRoleIds.some(rid => member.roles.cache.has(rid))) return true;
    return false;
}

module.exports = {
    data: { name: 'tickets' },
    async execute(message) {
        if (!isStaff(message.member)) return message.reply('❌ Staff uniquement.');

        const list = getOpenTickets(message.guild.id);
        if (!list.length) return message.reply('📋 Aucun ticket ouvert.');

        const lines = list.map(([id, t]) => {
            const ch = message.guild.channels.cache.get(t.channelId);
            return `• <#${t.channelId}> — <@${t.userId}>`;
        });
        await message.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('📋 Tickets ouverts')
                .setDescription(lines.join('\n'))
                .setTimestamp()],
        });
    },
};
