const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

function parseDuration(durationStr) {
    const regex = /^(\d+)m$/;
    const match = durationStr.toLowerCase().match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    return value * 60 * 1000;
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / (60 * 1000));
    return `${minutes}m`;
}

module.exports = {
    data: {
        name: 'timeout',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { staff, full } = require('../utils/perms');
        const { getRandomNoPermission, getRandomWrongChannel, getRandomSelfSanction, getRandomBotSanction, getRandomHierarchy, getRandomUserNotFound, getRandomInvalidDuration, getRandomBotPermission, getRandomInvalidUsage } = require('../utils/messages');
        
        const hasFullPerms = full(message.author.id, message.guild?.id);
        
        if (!staff(message.member)) {
            return message.reply(getRandomNoPermission('timeout', false));
        }

        // check args
        if (args.length < 2) {
            return message.reply(getRandomInvalidUsage('timeout'));
        }

        // get user from mentions (ignore reply mentions)
        let targetUser = null;
        let repliedUserId = null;
        
        // If message is a reply, get the replied user ID to exclude it
        if (message.reference && message.reference.messageId) {
            try {
                const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
                repliedUserId = repliedMessage.author.id;
            } catch (error) {
                // If we can't fetch the replied message, continue without filtering
            }
        }
        
        // Get mentions, excluding the replied user if it's a reply
        const allMentions = message.mentions.members;
        if (repliedUserId && allMentions.size > 1) {
            // Filter out the replied user
            targetUser = allMentions.find(member => member.id !== repliedUserId) || null;
        } else if (repliedUserId && allMentions.size === 1 && allMentions.first().id === repliedUserId) {
            // Only the replied user is mentioned, that's not valid
            targetUser = null;
        } else {
            targetUser = allMentions.first();
        }
        
        // check if bot is mentioned
        if (targetUser && targetUser.id === message.client.user.id) {
            return message.reply(getRandomBotSanction('timeout'));
        }
        
        if (!targetUser) {
            return message.reply(getRandomUserNotFound());
        }

        // check self sanction
        if (targetUser.id === message.author.id) {
            return message.reply(getRandomSelfSanction('timeout'));
        }
        if (targetUser.id === message.client.user.id) {
            return message.reply(getRandomBotSanction('timeout'));
        }

        // check hierarchy (skip if full permissions)
        if (!hasFullPerms) {
            const { canSanction } = require('../utils/perms');
            if (!canSanction(message.member, targetUser)) {
                return message.reply(getRandomHierarchy('timeout'));
            }
        }

        // parse duration
        const durationStr = args[1];
        const durationMs = parseDuration(durationStr);
        const reason = args.slice(2).join(' ') || 'Rien frr, juste comme ça';

        if (!durationMs) {
            return message.reply(getRandomInvalidDuration());
        }

        if (durationMs > config.maxTimeoutDuration) {
            return message.reply(`❌ La durée maximale est de 10 minutes. Vous avez spécifié: ${formatDuration(durationMs)}`);
        }

        try {
            // check bot perm
            if (!message.guild.members.me.permissions.has([PermissionFlagsBits.ModerateMembers])) {
                return message.reply(getRandomBotPermission());
            }

            if (!hasFullPerms && targetUser.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                return message.reply(getRandomHierarchy('timeout'));
            }

            // apply timeout
            await targetUser.timeout(durationMs, reason);

            const formattedDuration = formatDuration(durationMs);
            await message.reply(`✅ ${targetUser} a été timeout pendant ${formattedDuration}.`);

            // send log
            const logChId = config.getConfig(message.guild.id).logChannelId;
            if (logChId) {
                const logChannel = message.guild.channels.cache.get(logChId);
                if (logChannel) {
                    try {
                        await logChannel.send({
                            embeds: [{
                                color: 0xFF6B6B,
                                title: '⏱️ Timeout',
                                fields: [
                                    { name: 'Utilisateur', value: `${targetUser} (${targetUser.user.tag})`, inline: true },
                                    { name: 'Par', value: `${message.author} (${message.author.tag})`, inline: true },
                                    { name: 'Durée', value: formattedDuration, inline: true },
                                    { name: 'Raison', value: reason, inline: false },
                                ],
                                timestamp: new Date().toISOString(),
                            }],
                        });
                    } catch (error) {
                        console.error('Erreur lors de l\'envoi du log:', error);
                    }
                }
            }

        } catch (error) {
            console.error('Erreur lors du timeout:', error);
            const { getRandomError } = require('../utils/messages');
            message.reply(getRandomError());
        }
    },
};
