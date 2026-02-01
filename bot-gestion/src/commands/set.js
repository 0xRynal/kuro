const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const guildConfig = require('../utils/guildConfig');

function canSet(member) {
    if (!member) return false;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (ids.includes(member.id)) return true;
    return member.permissions?.has(PermissionFlagsBits.Administrator);
}

module.exports = {
    data: { name: 'set' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!canSet(message.member)) return message.reply('❌ Admin uniquement.');

        const sub = args[0]?.toLowerCase();
        const p = config.prefix;

        if (!sub || sub === 'config' || sub === 'show') {
            const cfg = config.getConfig(message.guild.id);
            return message.reply({
                embeds: [{
                    color: 0x5865F2,
                    title: '⚙️ Config Gestion',
                    description: [
                        `**log** ${cfg.logChannelId ? `<#${cfg.logChannelId}>` : '(env)'}`,
                        `**fullperm** ${cfg.fullPermissionUserIds?.length ? cfg.fullPermissionUserIds.join(', ') : '(env)'}`,
                        `**highrank** ${cfg.highRankRoleId ? `<@&${cfg.highRankRoleId}>` : '(env)'}`,
                    ].join('\n'),
                    footer: { text: `${p}set <log|fullperm|highrank> <id|ids>` },
                    timestamp: new Date().toISOString(),
                }],
            });
        }

        const val = args.slice(1).join(' ').trim();
        const guildId = message.guild.id;

        switch (sub) {
            case 'log': {
                const id = val.replace(/\D/g, '');
                guildConfig.set(guildId, 'logChannelId', id || '');
                return message.reply(`✅ Log: ${id ? `<#${id}>` : 'désactivé'}`);
            }
            case 'fullperm': {
                const ids = val ? val.split(/[, ]+/).map(s => s.replace(/\D/g, '')).filter(Boolean) : [];
                guildConfig.set(guildId, 'fullPermissionUserIds', ids);
                return message.reply(`✅ Full perm: ${ids.length ? ids.join(', ') : 'vidé'}`);
            }
            case 'highrank': {
                const id = val.replace(/\D/g, '');
                guildConfig.set(guildId, 'highRankRoleId', id || '');
                return message.reply(`✅ High rank: ${id ? `<@&${id}>` : 'désactivé'}`);
            }
            default:
                return message.reply(`Usage: \`${p}set log|fullperm|highrank <id>\``);
        }
    },
};
