const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

function parseDuration(durationStr) {
    const regex = /^(\d+)([smh])$/;
    const match = durationStr.toLowerCase().match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === 's') {
        return value * 1000;
    } else if (unit === 'm') {
        return value * 60 * 1000;
    } else if (unit === 'h') {
        return value * 60 * 60 * 1000;
    }
    
    return null;
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h${minutes % 60 > 0 ? minutes % 60 + 'm' : ''}`;
    }
    if (minutes > 0) {
        return `${minutes}m${seconds % 60 > 0 ? seconds % 60 + 's' : ''}`;
    }
    return `${seconds}s`;
}

module.exports = {
    data: {
        name: 'slowmode',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { canUse } = require('../utils/perms');
        const { getRandomNoPermission, getRandomBotPermission, getRandomError, getRandomInvalidUsage } = require('../utils/messages');
        
        if (!canUse(message.member, 'slowmode')) {
            return message.reply(getRandomNoPermission('slowmode', false));
        }

        if (args.length < 2) {
            return message.reply(getRandomInvalidUsage('slowmode'));
        }

        const slowmodeDurationStr = args[0];
        const activeDurationStr = args[1];

        const slowmodeSeconds = parseInt(slowmodeDurationStr);
        if (isNaN(slowmodeSeconds) || slowmodeSeconds < 0 || slowmodeSeconds > 21600) {
            return message.reply('❌ Le slowmode doit être entre 0 et 21600 secondes (6 heures).');
        }

        const activeDurationMs = parseDuration(activeDurationStr);
        if (!activeDurationMs) {
            return message.reply('❌ Format de durée invalide. Utilise: `5m`, `10m`, `1h`');
        }

        try {
            if (!message.guild.members.me.permissions.has([PermissionFlagsBits.ManageChannels])) {
                return message.reply(getRandomBotPermission());
            }

            await message.channel.setRateLimitPerUser(slowmodeSeconds, `Slowmode activé par ${message.author.tag}`);

            const formattedActiveDuration = formatDuration(activeDurationMs);
            await message.reply(`⏱️ Slowmode de ${slowmodeSeconds} secondes activé pour ${formattedActiveDuration}.`);

            const logChId = config.getConfig(message.guild.id).logChannelId;
            if (logChId) {
                const logChannel = message.guild.channels.cache.get(logChId);
                if (logChannel) {
                    try {
                        await logChannel.send({
                            embeds: [{
                                color: 0xFFA500,
                                title: '⏱️ Slowmode Activé',
                                fields: [
                                    { name: 'Channel', value: `${message.channel}`, inline: true },
                                    { name: 'Par', value: `${message.author} (${message.author.tag})`, inline: true },
                                    { name: 'Slowmode', value: `${slowmodeSeconds} secondes`, inline: true },
                                    { name: 'Durée', value: formattedActiveDuration, inline: true },
                                ],
                                timestamp: new Date().toISOString(),
                            }],
                        });
                    } catch (error) {
                        console.error('Erreur lors de l\'envoi du log:', error);
                    }
                }
            }

            setTimeout(async () => {
                try {
                    await message.channel.setRateLimitPerUser(0, `Slowmode désactivé automatiquement après ${formattedActiveDuration}`);
                } catch (error) {
                    console.error('Erreur lors de la désactivation automatique du slowmode:', error);
                }
            }, activeDurationMs);

        } catch (error) {
            console.error('Erreur lors du slowmode:', error);
            message.reply(getRandomError());
        }
    },
};
