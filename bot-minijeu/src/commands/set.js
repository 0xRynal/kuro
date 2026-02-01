const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const guildConfig = require('../utils/guildConfig');

function isAdmin(member) {
    return member?.permissions?.has(PermissionFlagsBits.Administrator);
}

module.exports = {
    data: { name: 'set' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!isAdmin(message.member)) return message.reply('❌ Admin uniquement.');

        const sub = args[0]?.toLowerCase();
        const p = config.prefix;

        if (!sub || sub === 'config' || sub === 'show') {
            const cfg = config.getConfig(message.guild.id);
            return message.reply({
                embeds: [{
                    color: 0x5865F2,
                    title: '⚙️ Config Minijeu',
                    description: [
                        `**games** ${cfg.gamesChannelId ? `<#${cfg.gamesChannelId}>` : '(env)'}`,
                        `**log** ${cfg.logChannelId ? `<#${cfg.logChannelId}>` : '(env)'}`,
                        `**punitions** ${cfg.punitionsChannelId ? `<#${cfg.punitionsChannelId}>` : '(env)'}`,
                        `**highrank** ${cfg.highRankRoleId ? `<@&${cfg.highRankRoleId}>` : '(env)'}`,
                        `**fullperm** ${cfg.fullPermissionUserIds?.length ? cfg.fullPermissionUserIds.join(', ') : '(env)'}`,
                    ].join('\n'),
                    footer: { text: `${p}set <games|log|punitions|highrank|fullperm> <id>` },
                    timestamp: new Date().toISOString(),
                }],
            });
        }

        const val = args.slice(1).join(' ').trim();
        const guildId = message.guild.id;

        switch (sub) {
            case 'games': {
                const id = val.replace(/\D/g, '');
                guildConfig.set(guildId, 'gamesChannelId', id || '');
                return message.reply(`✅ Games: ${id ? `<#${id}>` : 'désactivé'}`);
            }
            case 'log': {
                const id = val.replace(/\D/g, '');
                guildConfig.set(guildId, 'logChannelId', id || '');
                return message.reply(`✅ Log: ${id ? `<#${id}>` : 'désactivé'}`);
            }
            case 'punitions': {
                const id = val.replace(/\D/g, '');
                guildConfig.set(guildId, 'punitionsChannelId', id || '');
                return message.reply(`✅ Punitions: ${id ? `<#${id}>` : 'désactivé'}`);
            }
            case 'highrank': {
                const id = val.replace(/\D/g, '');
                guildConfig.set(guildId, 'highRankRoleId', id || '');
                return message.reply(`✅ High rank: ${id ? `<@&${id}>` : 'désactivé'}`);
            }
            case 'fullperm': {
                const ids = val ? val.split(/[, ]+/).map(s => s.replace(/\D/g, '')).filter(Boolean) : [];
                guildConfig.set(guildId, 'fullPermissionUserIds', ids);
                return message.reply(`✅ Full perm: ${ids.length ? ids.join(', ') : 'vidé'}`);
            }
            default:
                return message.reply(`Usage: \`${p}set <games|log|punitions|highrank|fullperm> <id>\``);
        }
    },
};
