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
            const logId = config.getLogChannelId(message.guild.id);
            return message.reply({
                embeds: [{
                    color: 0x2C2F33,
                    title: '⚙️ Config BL',
                    description: `**log** ${logId ? `<#${logId}>` : '(env)'}`,
                    footer: { text: `${p}set log <channelId>` },
                    timestamp: new Date().toISOString(),
                }],
            });
        }

        if (sub === 'log') {
            const id = args.slice(1).join(' ').replace(/\D/g, '');
            guildConfig.set(message.guild.id, 'logChannelId', id || '');
            return message.reply(`✅ Log: ${id ? `<#${id}>` : 'désactivé'}`);
        }
        return message.reply(`Usage: \`${p}set log <channelId>\``);
    },
};
