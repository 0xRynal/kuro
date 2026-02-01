const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'clear',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { hasFullPermissions } = require('../utils/whitelist');
        const { getRandomNoPermission, getRandomBotPermission, getRandomInvalidUsage, getRandomError } = require('../utils/messages');
        
        // Vérifier que l'utilisateur a les permissions full
        if (!hasFullPermissions(message.author.id, message.guild?.id)) {
            return message.reply(getRandomNoPermission('clear', false));
        }

        // Vérifier les permissions du bot
        if (!message.guild.members.me.permissions.has([PermissionFlagsBits.ManageMessages])) {
            return message.reply(getRandomBotPermission());
        }

        // Récupérer le nombre de messages à supprimer
        let amount = parseInt(args[0]);
        
        if (!amount || isNaN(amount) || amount < 1) {
            return message.reply(`❌ Utilisation: \`${config.prefix}clear <nombre>\``);
        }

        // Limiter à 100 messages maximum par sécurité
        if (amount > 100) {
            amount = 100;
        }

        // Ajouter 1 pour inclure le message de commande
        amount = amount + 1;

        try {
            // Récupérer les messages (limite de 100 pour Discord API)
            const messages = await message.channel.messages.fetch({ limit: Math.min(amount, 100) });
            
            // Filtrer les messages de moins de 14 jours (requis pour bulkDelete)
            const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
            const messagesToDelete = messages.filter(msg => 
                msg.createdTimestamp >= twoWeeksAgo
            );

            if (messagesToDelete.size === 0) {
                return message.reply('❌ Aucun message à supprimer (les messages doivent être de moins de 14 jours).');
            }

            // Supprimer les messages
            if (messagesToDelete.size === 1) {
                await messagesToDelete.first().delete();
            } else {
                await message.channel.bulkDelete(messagesToDelete, true);
            }

            // Envoyer une confirmation qui se supprime après 3 secondes
            const confirmation = await message.channel.send(`✅ ${messagesToDelete.size} message(s) supprimé(s).`);
            
            setTimeout(async () => {
                try {
                    await confirmation.delete();
                } catch (error) {
                    // Ignorer si le message a déjà été supprimé
                }
            }, 3000);

        } catch (error) {
            console.error('Erreur lors de la suppression des messages:', error);
            
            // Si bulkDelete échoue (messages trop vieux), essayer de supprimer individuellement
            if (error.code === 50034) {
                try {
                    const messages = await message.channel.messages.fetch({ limit: Math.min(amount, 100) });
                    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
                    let deletedCount = 0;

                    for (const msg of messages.values()) {
                        if (msg.createdTimestamp >= twoWeeksAgo) {
                            try {
                                await msg.delete();
                                deletedCount++;
                            } catch (e) {
                                // Ignorer les erreurs individuelles
                            }
                        }
                    }

                    if (deletedCount > 0) {
                        const confirmation = await message.channel.send(`✅ ${deletedCount} message(s) supprimé(s) individuellement.`);
                        setTimeout(async () => {
                            try {
                                await confirmation.delete();
                            } catch (error) {
                                // Ignorer
                            }
                        }, 3000);
                    } else {
                        message.reply('❌ Impossible de supprimer les messages (ils sont probablement trop anciens).');
                    }
                } catch (err) {
                    message.reply(getRandomError());
                }
            } else {
                message.reply(getRandomError());
            }
        }
    },
};
