const config = require('../config');

module.exports = {
    data: { name: 'help' },
    async execute(message) {
        const p = config.prefix;
        await message.reply({
            embeds: [{
                color: 0xFFD700,
                title: '💰 Bot Coin',
                fields: [
                    { name: `${p}balance [@user]`, value: 'Affiche le solde', inline: false },
                    { name: `${p}pay @user <montant>`, value: `Envoyer des coins (taxe ${(config.taxPay * 100)}%)`, inline: false },
                    { name: `${p}daily`, value: 'Récompense quotidienne', inline: false },
                    { name: `${p}top`, value: 'Classement des plus riches', inline: false },
                ],
                timestamp: new Date().toISOString(),
            }],
        });
    },
};
