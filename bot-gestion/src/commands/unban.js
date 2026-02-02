const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'unban',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { canUse } = require('../utils/perms');
        const { getRandomNoPermission, getRandomBotPermission, getRandomUserNotFound, getRandomInvalidUsage, getRandomError } = require('../utils/messages');
        
        if (!canUse(message.member, 'unban')) {
            return message.reply(getRandomNoPermission('unban', false));
        }

        if (args.length < 1) {
            return message.reply(getRandomInvalidUsage('unban'));
        }

        const firstArg = args[0];
        let userId = null;

        // Try to get user by mention first
        if (message.mentions.members.size > 0) {
            userId = message.mentions.members.first().id;
        } else if (message.mentions.users.size > 0) {
            userId = message.mentions.users.first().id;
        } else if (/^\d{17,19}$/.test(firstArg)) {
            // User ID
            userId = firstArg;
        } else {
            // Try to find user by tag/username in ban list
            try {
                const bans = await message.guild.bans.fetch();
                const searchTerm = firstArg.toLowerCase();
                const bannedUser = bans.find(ban => {
                    const tag = ban.user.tag.toLowerCase();
                    const username = ban.user.username.toLowerCase();
                    return tag.includes(searchTerm) || username.includes(searchTerm) || ban.user.id === searchTerm;
                });
                
                if (bannedUser) {
                    userId = bannedUser.user.id;
                } else {
                    return message.reply(getRandomUserNotFound());
                }
            } catch (error) {
                return message.reply('❌ Impossible de récupérer la liste des bannis.');
            }
        }

        try {
            if (!message.guild.members.me.permissions.has([PermissionFlagsBits.BanMembers])) {
                return message.reply(getRandomBotPermission());
            }

            // Check if user is banned
            let bannedUser;
            try {
                bannedUser = await message.guild.bans.fetch(userId);
            } catch (error) {
                return message.reply('❌ Cet utilisateur n\'est pas banni.');
            }

            // Unban the user
            await message.guild.members.unban(userId, `Débanni par ${message.author.tag}`);

            const userTag = bannedUser.user.tag;
            await message.reply(`✅ ${userTag} (${userId}) a été débanni.`);

            // Send log
            const logChId = config.getConfig(message.guild.id).logChannelId;
            if (logChId) {
                const logChannel = message.guild.channels.cache.get(logChId);
                if (logChannel) {
                    try {
                        await logChannel.send({
                            embeds: [{
                                color: 0x00FF00,
                                title: '🔓 Unban',
                                fields: [
                                    { name: 'Utilisateur', value: `${userTag} (${userId})`, inline: true },
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
            console.error('Erreur lors de l\'unban:', error);
            message.reply(getRandomError());
        }
    },
};
