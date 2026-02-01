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
            const gid = guildConfig.get('guildId') || config.guildId;
            const cat = guildConfig.get('categoryId') || config.categoryId;
            const log = guildConfig.get('logChannelId') || config.logChannelId;
            const staff = guildConfig.get('staffRoleIds');
            const staffArr = Array.isArray(staff) ? staff : (staff ? String(staff).split(',') : config.staffRoleIds);
            return message.reply({
                embeds: [{
                    color: 0x5865F2,
                    title: '⚙️ Config Modmail',
                    description: [
                        `**guild** ${gid || '(env)'}`,
                        `**category** ${cat ? cat : '(env)'}`,
                        `**log** ${log ? `<#${log}>` : '(env)'}`,
                        `**staff** ${staffArr?.length ? staffArr.map(r => `<@&${r}>`).join(', ') : '(env)'}`,
                    ].join('\n'),
                    footer: { text: `${p}set <guild|category|log|staff> <id|ids>` },
                    timestamp: new Date().toISOString(),
                }],
            });
        }

        const val = args.slice(1).join(' ').trim();
        const guildId = message.guild.id;
        const id = val.replace(/\D/g, '');

        switch (sub) {
            case 'guild':
                guildConfig.set('guildId', id || guildId);
                return message.reply(`✅ Guild cible: ${id ? id : guildId}`);
            case 'category':
                guildConfig.set('guildId', guildConfig.get('guildId') || guildId);
                guildConfig.set('categoryId', id);
                return message.reply(`✅ Catégorie: ${id}`);
            case 'log':
                guildConfig.set('guildId', guildConfig.get('guildId') || guildId);
                guildConfig.set('logChannelId', id);
                return message.reply(`✅ Channel log: ${id ? `<#${id}>` : 'désactivé'}`);
            case 'staff':
                guildConfig.set('guildId', guildConfig.get('guildId') || guildId);
                const ids = val ? val.split(/[, ]+/).map(s => s.replace(/\D/g, '')).filter(Boolean) : [];
                guildConfig.set('staffRoleIds', ids);
                return message.reply(`✅ Rôles staff: ${ids.length ? ids.map(r => `<@&${r}>`).join(', ') : 'vidé'}`);
            default:
                return message.reply(`Usage: \`${p}set guild|category|log|staff <id>\``);
        }
    },
};
