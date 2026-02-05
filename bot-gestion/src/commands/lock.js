const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'lock',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { canUse } = require('../utils/perms');
        const { getRandomNoPermission, getRandomWrongChannel, getRandomBotPermission, getRandomError } = require('../utils/messages');
        
        if (!canUse(message.member, 'lock')) {
            return message.reply(getRandomNoPermission('lock', false));
        }

        try {
            if (!message.guild.members.me.permissions.has([PermissionFlagsBits.ManageChannels])) {
                return message.reply(getRandomBotPermission());
            }

            const everyoneRole = message.guild.roles.everyone;
            
            await message.channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false,
            }, { reason: `Channel verrouillé par ${message.author.tag}` });

            await message.reply(`🔒 Le channel a été verrouillé.`);

            const logChId = config.getConfig(message.guild.id).logChannelId;
            if (logChId) {
                const logChannel = message.guild.channels.cache.get(logChId);
                if (logChannel) {
                    try {
                        await logChannel.send({
                            embeds: [{
                                color: 0xFF0000,
                                title: '🔒 Channel Verrouillé',
                                fields: [
                                    { name: 'Channel', value: `${message.channel}`, inline: true },
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
            console.error('Erreur lors du lock:', error);
            const { getRandomError, safeReply } = require('../utils/messages');
            await safeReply(message, getRandomError());
        }
    },
};
