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

        await guild.members.fetch({ withPresences: true }).catch(() => {});
        const total = guild.memberCount;
        const online = guild.members.cache.filter(m => m.presence?.status && m.presence.status !== 'offline').size;
        const inVoice = guild.members.cache.filter(m => m.voice?.channel).size;
        const invite = config.inviteCode || 'kuronai';
        await message.reply(
            `🪻・Membres : ${total}\n` +
            `🪻・En ligne : ${online}\n` +
            `🪻・Vocal : ${inVoice}\n` +
            `🪻・.gg/${invite}`
        );
    },
};
