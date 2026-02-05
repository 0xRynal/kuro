const { Routes } = require('discord.js');

function buildEmbed(g, options = {}) {
    const iconURL = g.iconURL?.({ size: 4096, dynamic: true }) ?? g.icon;
    const bannerURL = g.bannerURL?.({ size: 4096, dynamic: true }) ?? g.banner ?? null;
    const fields = [
        { name: '👥 Membres', value: String(g.memberCount ?? g.approximate_member_count ?? '—'), inline: true },
        { name: '📅 Création', value: g.createdAt ? `<t:${Math.floor(g.createdAt.getTime() / 1000)}:F>` : '—', inline: true },
        { name: '🆔 ID', value: g.id, inline: true },
    ];
    if (g.ownerId) fields.push({ name: '👑 Propriétaire', value: `<@${g.ownerId}>`, inline: true });
    if (g.approximate_presence_count != null) fields.push({ name: '🟢 En ligne (approx.)', value: String(g.approximate_presence_count), inline: true });
    if (g.channels?.cache != null) {
        fields.push({ name: '📊 Salons', value: `${g.channels.cache.size} (${g.channels.cache.filter(c => c.type === 2).size} vocaux)`, inline: true });
        fields.push({ name: '🎭 Rôles', value: String(g.roles.cache.size), inline: true });
    }
    if (g.description) fields.push({ name: '📝 Description', value: g.description.slice(0, 1024), inline: false });

    return {
        color: 0x5865F2,
        title: g.name,
        description: options.footerNote || undefined,
        thumbnail: iconURL ? { url: typeof iconURL === 'string' ? iconURL : iconURL } : undefined,
        image: bannerURL ? { url: typeof bannerURL === 'string' ? bannerURL : bannerURL } : undefined,
        fields,
        footer: options.footer ? { text: options.footer } : undefined,
        timestamp: new Date().toISOString(),
    };
}

module.exports = {
    data: { name: 'infoserv' },
    async execute(message, args) {
        const client = message.client;
        const guildId = args[0]?.trim();
        let g = null;
        let footerNote = null;

        if (guildId) {
            g = await client.guilds.fetch(guildId).catch(() => null);
            if (!g) {
                const preview = await client.rest.get(Routes.guildPreview(guildId)).catch(() => null);
                if (preview) {
                    g = {
                        id: preview.id,
                        name: preview.name,
                        icon: preview.icon ? `https://cdn.discordapp.com/icons/${preview.id}/${preview.icon}.${preview.icon.startsWith('a_') ? 'gif' : 'png'}?size=4096` : null,
                        banner: preview.banner ? `https://cdn.discordapp.com/banners/${preview.id}/${preview.banner}.${preview.banner.startsWith('a_') ? 'gif' : 'png'}?size=4096` : null,
                        description: preview.description ?? null,
                        approximate_member_count: preview.approximate_member_count,
                        approximate_presence_count: preview.approximate_presence_count,
                    };
                    footerNote = 'Prévisualisation publique (bot non présent sur ce serveur)';
                } else {
                    return message.reply('❌ Impossible : le bot n’est pas dans ce serveur. Discord ne permet la prévisualisation que pour les serveurs avec **Communauté** activée (paramètres du serveur).').catch(() => {});
                }
            }
        } else {
            if (!message.guild) return message.reply('❌ Utilise un ID de serveur : `.infoserv <id>`').catch(() => {});
            g = message.guild;
        }

        const footer = `Demandé par ${message.author.tag}`;
        await message.reply({
            embeds: [buildEmbed(g, { footer, footerNote })],
        });
    },
};
