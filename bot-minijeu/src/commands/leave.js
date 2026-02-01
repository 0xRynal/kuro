const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'leave',
    },
    async execute(message, args) {
        try {
            // Vérifier que c'est le bon utilisateur
            const authorizedUserId = '685552160594723015';
            if (message.author.id !== authorizedUserId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Permission refusée')
                    .setDescription('Tu n\'as pas la permission d\'utiliser cette commande.')
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Vérifier que c'est dans un serveur
            if (!message.guild) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Erreur')
                    .setDescription('Cette commande ne peut être utilisée que dans un serveur.')
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Confirmer avant de quitter
            const confirmEmbed = new EmbedBuilder()
                .setColor(0xFF9900)
                .setTitle('⚠️ Confirmation requise')
                .setDescription(`Tu es sur le point de faire quitter le bot du serveur **${message.guild.name}**.\n\nCette action est irréversible.`)
                .setFooter({ 
                    text: message.author.username,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

            // Attendre 3 secondes puis quitter
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Quitter le serveur
            try {
                await message.guild.leave();
                
                const successEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Bot quitté')
                    .setDescription(`Le bot a quitté le serveur **${message.guild.name}** avec succès.`)
                    .setTimestamp();
                
                // Essayer d'envoyer un message (peut échouer si le bot a déjà quitté)
                try {
                    await confirmMsg.edit({ embeds: [successEmbed] });
                } catch (err) {
                    // Ignorer si le message ne peut pas être édité
                }
            } catch (error) {
                console.error('Erreur lors de la sortie du serveur:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Erreur')
                    .setDescription('Une erreur s\'est produite lors de la tentative de quitter le serveur.')
                    .setTimestamp();
                
                try {
                    await confirmMsg.edit({ embeds: [errorEmbed] });
                } catch (err) {
                    // Ignorer si le message ne peut pas être édité
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande leave:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Erreur')
                .setDescription('Une erreur s\'est produite lors de l\'exécution de la commande.')
                .setTimestamp();
            
            try {
                await message.reply({ embeds: [errorEmbed] });
            } catch (err) {
                // Ignorer si le message ne peut pas être envoyé
            }
        }
    },
};
