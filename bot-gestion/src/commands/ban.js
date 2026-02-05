const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'ban',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { canUse, canSanction, full } = require('../utils/perms');
        const { getRandomNoPermission, getRandomSelfSanction, getRandomBotSanction, getRandomHierarchy, getRandomUserNotFound, getRandomBotPermission, getRandomInvalidUsage, getRandomError, safeReply } = require('../utils/messages');
        
        if (!canUse(message.member, 'ban')) {
            return message.reply(getRandomNoPermission('ban', false));
        }

        if (args.length < 1) {
            return message.reply(getRandomInvalidUsage('ban'));
        }

        let targetUser = null;
        const firstArg = args[0];

        // Try to get user by mention first
        if (message.mentions.members.size > 0) {
            targetUser = message.mentions.members.first();
        } else if (/^\d{17,19}$/.test(firstArg)) {
            // Try to fetch user by ID
            try {
                const user = await message.client.users.fetch(firstArg);
                try {
                    targetUser = await message.guild.members.fetch(firstArg);
                } catch (e) {
                    // User not in guild, but we can still ban by ID
                    targetUser = { user, id: firstArg, guild: message.guild };
                }
            } catch (error) {
                return message.reply(getRandomUserNotFound());
            }
        } else {
            return message.reply(getRandomUserNotFound());
        }

        // Check if bot
        if (targetUser.user && targetUser.user.id === message.client.user.id) {
            return message.reply(getRandomBotSanction('ban'));
        }

        // Check self sanction
        if (targetUser.id === message.author.id || (targetUser.user && targetUser.user.id === message.author.id)) {
            return message.reply(getRandomSelfSanction('ban'));
        }

        // Check hierarchy (only if user is in guild)
        if (targetUser.roles?.highest && !full(message.author.id)) {
            if (!canSanction(message.member, targetUser)) {
                return message.reply(getRandomHierarchy('ban'));
            }
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        try {
            if (!message.guild.members.me.permissions.has([PermissionFlagsBits.BanMembers])) {
                return message.reply(getRandomBotPermission());
            }

            // Ban the user
            const userId = targetUser.user ? targetUser.user.id : targetUser.id;
            const userTag = targetUser.user ? targetUser.user.tag : `ID: ${userId}`;

            // Delete messages from the last 7 days
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            let totalDeleted = 0;

            const textChannels = message.guild.channels.cache.filter(channel => 
                channel.isTextBased() && channel.viewable && 
                channel.permissionsFor(message.guild.members.me)?.has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ViewChannel])
            );

            for (const channel of textChannels.values()) {
                try {
                    let hasMoreMessages = true;
                    let lastMessageId = null;
                    let deletedInChannel = 0;

                    while (hasMoreMessages && deletedInChannel < 1000) { // Limit per channel to avoid too much processing
                        const options = { limit: 100 };
                        if (lastMessageId) options.before = lastMessageId;

                        const messages = await channel.messages.fetch(options);
                        
                        if (messages.size === 0) {
                            hasMoreMessages = false;
                            break;
                        }

                        const messagesToDelete = messages.filter(msg => 
                            msg.author.id === userId && 
                            msg.createdTimestamp >= sevenDaysAgo &&
                            Date.now() - msg.createdTimestamp <= 14 * 24 * 60 * 60 * 1000 // Discord limit: can only bulk delete messages < 14 days old
                        );

                        if (messagesToDelete.size > 0) {
                            if (messagesToDelete.size === 1) {
                                try {
                                    await messagesToDelete.first().delete();
                                    deletedInChannel++;
                                } catch (e) {
                                    // Ignore deletion errors
                                }
                            } else {
                                try {
                                    await channel.bulkDelete(messagesToDelete, true);
                                    deletedInChannel += messagesToDelete.size;
                                } catch (e) {
                                    // If bulk delete fails, try individual deletion
                                    for (const msg of messagesToDelete.values()) {
                                        try {
                                            await msg.delete();
                                            deletedInChannel++;
                                        } catch (e) {
                                            // Ignore individual deletion errors
                                        }
                                    }
                                }
                            }
                        }

                        // Check if we need to continue (if oldest message is still within 7 days)
                        const oldestMessage = messages.last();
                        if (!oldestMessage || oldestMessage.createdTimestamp < sevenDaysAgo) {
                            hasMoreMessages = false;
                        } else {
                            lastMessageId = oldestMessage.id;
                        }
                    }

                    totalDeleted += deletedInChannel;
                } catch (error) {
                    // Ignore errors per channel, continue with others
                    console.error(`Erreur lors de la suppression des messages dans ${channel.name}:`, error);
                }
            }

            await message.guild.members.ban(userId, { 
                reason: `Banni par ${message.author.tag}: ${reason}`,
                deleteMessageSeconds: 604800 // 7 days in seconds
            });

            await message.reply(`✅ ${userTag} a été banni.${totalDeleted > 0 ? ` ${totalDeleted} message(s) supprimé(s).` : ''}`);

            // Send log
            const logChId = config.getConfig(message.guild.id).logChannelId;
            if (logChId) {
                const logChannel = message.guild.channels.cache.get(logChId);
                if (logChannel) {
                    try {
                        await logChannel.send({
                            embeds: [{
                                color: 0xFF0000,
                                title: '🔨 Ban',
                                fields: [
                                    { name: 'Utilisateur', value: `${userTag} (${userId})`, inline: true },
                                    { name: 'Par', value: `${message.author} (${message.author.tag})`, inline: true },
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
            console.error('Erreur lors du ban:', error);
            const { safeReply } = require('../utils/messages');
            await safeReply(message, getRandomError());
        }
    },
};
