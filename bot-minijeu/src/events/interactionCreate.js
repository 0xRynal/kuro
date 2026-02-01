const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Only handle button interactions
        if (!interaction.isButton()) return;
        
        // Handle classement pagination (handled in classement.js collector)
        if (interaction.customId.startsWith('classement_prev_') || interaction.customId.startsWith('classement_next_')) {
            return; // Let the collector in classement.js handle it
        }
        
        // Handle shop interactions (handled in shop.js collector)
        if (interaction.customId.startsWith('shop_') || interaction.customId.startsWith('buy_')) {
            return; // Let the collector in shop.js handle it
        }
        
        // Handle help command buttons
        if (interaction.customId === 'help_games') {
            const devUser = await interaction.client.users.fetch('685552160594723015').catch(() => null);
            
            let fields = [];
            let title = '';
            
            if (interaction.customId === 'help_games') {
                title = '🎮 Commandes Mini-Jeux';
                fields = [
                    {
                        name: `🎲 ${config.prefix}destin`,
                        value: 'Tente ta chance pour gagner ou perdre des pièces\nGains aléatoires, multiplicateurs, clés, malédictions...',
                        inline: false,
                    },
                    {
                        name: `🧰 ${config.prefix}ouvrir coffre_xxx`,
                        value: 'Ouvre un coffre avec une clé\nTypes: `coffre_bois`, `coffre_argent`, `coffre_or` (ou `coffre_doré`), `coffre_demoniaque`',
                        inline: false,
                    },
                    {
                        name: `⚔️ ${config.prefix}arene [@user]`,
                        value: `Combat automatique\n\`${config.prefix}arene\` → adversaire aléatoire\n\`${config.prefix}arene @user\` → combat contre un ami`,
                        inline: false,
                    },
                    {
                        name: `🎒 ${config.prefix}inventaire`,
                        value: 'Affiche ton inventaire : pièces, clés, objets et statistiques',
                        inline: false,
                    },
                    {
                        name: `🏆 ${config.prefix}classement`,
                        value: 'Affiche le top 100 des joueurs par pièces',
                        inline: false,
                    },
                    {
                        name: `🛒 ${config.prefix}shop`,
                        value: 'Ouvre la boutique pour acheter des clés et objets',
                        inline: false,
                    },
                    {
                        name: `🎁 ${config.prefix}daily`,
                        value: 'Réclame ta récompense quotidienne et continue ton streak !',
                        inline: false,
                    },
                    {
                        name: `📊 ${config.prefix}resume`,
                        value: 'Vue d\'ensemble rapide : charges, pièces, progression',
                        inline: false,
                    },
                    {
                        name: `🎯 ${config.prefix}objectifs`,
                        value: 'Affiche tes objectifs actifs (défis, paliers, prestige)',
                        inline: false,
                    },
                    {
                        name: `⚔️ ${config.prefix}rival`,
                        value: `Gère tes rivalités : \`${config.prefix}rival list\` ou \`${config.prefix}rival challenge @user <mise>\``,
                        inline: false,
                    },
                    {
                        name: `⭐ ${config.prefix}prestige`,
                        value: 'Reset partiel avec bonus permanent (niveau 20 requis)',
                        inline: false,
                    },
                    {
                        name: `🔧 ${config.prefix}ameliorer <index>`,
                        value: 'Améliore un objet pour augmenter ses stats',
                        inline: false,
                    },
                    {
                        name: `🔧 ${config.prefix}reparer`,
                        value: 'Répare tes objets endommagés après les combats',
                        inline: false,
                    },
                ];
            }
            
            try {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(title)
                    .setAuthor(devUser ? {
                        name: `Kyoto Mini-Jeux - ${devUser.username}`,
                        iconURL: devUser.displayAvatarURL(),
                        url: `https://discord.com/users/685552160594723015`,
                    } : {
                        name: 'Kyoto Mini-Jeux',
                    })
                    .addFields(fields)
                    .setFooter({ 
                        text: devUser ? `By ${devUser.tag}` : 'By 0xRynal',
                        iconURL: devUser ? devUser.displayAvatarURL() : undefined
                    })
                    .setTimestamp();
                
                await interaction.update({
                    embeds: [embed],
                    components: [], // Remove buttons after selection
                }).catch(async err => {
                    if (err.code === 10008) {
                        // Message supprimé, ignorer silencieusement
                        return;
                    }
                    console.error('Erreur lors de l\'update interaction:', err);
                    // Si l'update a échoué, essayer un reply seulement si l'interaction n'a pas été consommée
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: '❌ Une erreur s\'est produite.', ephemeral: true }).catch(() => {});
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la mise à jour de l\'interaction:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: '❌ Une erreur s\'est produite.', ephemeral: true }).catch(() => {});
                }
            }
        }
    },
};
