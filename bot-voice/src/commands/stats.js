const { EmbedBuilder, ChannelType } = require('discord.js');
const config = require('../config');
const { getConfig, createChannels, updateChannels, deleteChannels, clearConfig } = require('../utils/statsChannels');

const ids = () => (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

module.exports = {
    data: { name: 'stats' },
    async execute(message, args) {
        if (!message.guild) return;
        const guild = message.guild;
        const sub = args[0]?.toLowerCase();

        if (sub === 'setup') {
            if (!ids().includes(message.author.id)) return message.reply('❌ Permission requise.');
            const cfg = getConfig(guild.id);
            if (cfg) {
                await deleteChannels(guild, cfg);
                clearConfig(guild.id);
            }
            const created = await createChannels(guild, config.statsCategoryId, config.inviteCode);
            if (created) {
                const cfg = getConfig(guild.id);
                if (cfg) await updateChannels(guild, cfg, config.inviteCode);
                return message.reply('✅ Channels stats créés sous la catégorie configurée.');
            }
            return message.reply('❌ Impossible de créer les channels. Vérifie la catégorie.');
        }

        if (sub === 'update') {
            if (!ids().includes(message.author.id)) return message.reply('❌ Permission requise.');
            const cfg = getConfig(guild.id);
            if (!cfg) return message.reply('❌ Lance `!v stats setup` d\'abord.');
            await updateChannels(guild, cfg, config.inviteCode);
            return message.reply('✅ Stats mises à jour.');
        }

        const inVoice = guild.members.cache.filter(m => m.voice?.channel).values();
        const members = [...inVoice];
        const inStage = members.filter(m => m.voice.channel?.type === ChannelType.GuildStageVoice).length;
        const muted = members.filter(m => m.voice.selfMute || m.voice.mute).length;
        const deafened = members.filter(m => m.voice.selfDeaf || m.voice.deaf).length;
        const streaming = members.filter(m => m.voice.streaming).length;
        const inVideo = members.filter(m => m.voice.selfVideo).length;

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`Statistiques vocales de 🌿 ${guild.name} 🌿`)
            .setThumbnail(guild.iconURL({ size: 256 }))
            .setDescription(
                `🗣️ **${members.length}** membres connectés\n` +
                `🎭 **${inStage}** membres en conférence\n` +
                `🔇 **${muted}** membres mute\n` +
                `🎧 **${deafened}** membres en sourdine\n` +
                `🔴 **${streaming}** membres en streaming\n` +
                `📹 **${inVideo}** membres en vidéo`
            )
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    },
};
