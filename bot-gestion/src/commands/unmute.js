const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'unmute',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { canUse } = require('../utils/perms');
        const { getRandomNoPermission, getRandomWrongChannel, getRandomError, getRandomUserNotFound, getRandomBotPermission, getRandomRoleNotFound, getRandomNotMuted, getRandomInvalidUsage } = require('../utils/messages');
        
        if (!canUse(message.member, 'unmute')) {
            return message.reply(getRandomNoPermission('unmute', false));
        }

        // check args
        if (args.length < 1) {
            return message.reply(getRandomInvalidUsage('unmute'));
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
        
        if (!targetUser) {
            return message.reply(getRandomUserNotFound());
        }

        try {
            // check bot perm
            if (!message.guild.members.me.permissions.has([PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ModerateMembers])) {
                return message.reply(getRandomBotPermission());
            }

            // get mute role
            const muteRole = message.guild.roles.cache.find(role => role.name === config.muteRoleName);
            
            if (!muteRole) {
                return message.reply(getRandomRoleNotFound());
            }

            // check if muted
            if (!targetUser.roles.cache.has(muteRole.id)) {
                return message.reply(getRandomNotMuted(targetUser));
            }

            // remove role
            await targetUser.roles.remove(muteRole);

            await message.reply(`✅ ${targetUser} a été unmute.`);

            // send log
            const logChId = config.getConfig(message.guild.id).logChannelId;
            if (logChId) {
                const logChannel = message.guild.channels.cache.get(logChId);
                if (logChannel) {
                    try {
                        await logChannel.send({
                            embeds: [{
                                color: 0x00FF00,
                                title: '🔓 Unmute',
                                fields: [
                                    { name: 'Utilisateur', value: `${targetUser} (${targetUser.user.tag})`, inline: true },
                                    { name: 'Par', value: `${message.author} (${message.author.tag})`, inline: true },
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
            console.error('Erreur lors de l\'unmute:', error);
            const { safeReply } = require('../utils/messages');
            await safeReply(message, getRandomError());
        }
    },
};
