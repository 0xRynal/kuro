const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { getByChannel, close } = require('../utils/tickets');

function isStaff(member) {
    if (!member) return false;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (ids.includes(member.id)) return true;
    if (config.staffRoleIds.length && config.staffRoleIds.some(rid => member.roles.cache.has(rid))) return true;
    return false;
}

module.exports = {
    data: { name: 'close' },
    async execute(message, args) {
        const ticket = getByChannel(message.channel.id);
        if (!ticket) return message.reply('❌ Ce channel n\'est pas un ticket.');
        if (!isStaff(message.member)) return message.reply('❌ Staff uniquement.');

        close(message.channel.id);

        try {
            const user = await message.client.users.fetch(ticket.userId);
            await user.send({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('📩 Ticket fermé')
                    .setDescription('Ton ticket a été fermé par le staff. Tu peux en ouvrir un nouveau en m\'envoyant un DM.')
                    .setTimestamp()],
            }).catch(() => {});
        } catch {}

        const reason = args.join(' ') || 'Fermé par le staff';
        await message.reply(`✅ Ticket fermé. ${reason}`);

        if (config.logChannelId) {
            const logCh = message.guild.channels.cache.get(config.logChannelId);
            if (logCh) {
                await logCh.send({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('Ticket fermé')
                        .addFields(
                            { name: 'User', value: `<@${ticket.userId}>`, inline: true },
                            { name: 'Par', value: message.author.tag, inline: true },
                            { name: 'Raison', value: reason, inline: false },
                        )
                        .setTimestamp()],
                }).catch(() => {});
            }
        }

        setTimeout(() => message.channel.delete().catch(() => {}), 3000);
    },
};
