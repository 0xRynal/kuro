const { EmbedBuilder } = require('discord.js');
const { getUser, addCoins } = require('../utils/game');
const { addToCoinWallet } = require('../utils/coinWallet');

module.exports = {
    data: { name: 'retrait' },
    async execute(message, args) {
        const amount = parseInt(args[0], 10);
        if (!Number.isInteger(amount) || amount < 1) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(0xFF0000).setTitle('❌ Retrait').setDescription(`Utilisation: \`${require('../config').prefix}retrait <montant>\``).setTimestamp()],
            });
        }
        const userId = message.author.id;
        const user = getUser(userId);
        const coins = user.coins ?? 0;
        if (coins < amount) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(0xFF0000).setTitle('❌ Solde insuffisant').setDescription(`Tu as **${coins.toLocaleString()}** pièces.`).setTimestamp()],
            });
        }
        addCoins(userId, -amount);
        addToCoinWallet(userId, amount);
        const e = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('💰 Retrait')
            .setDescription(`**${amount.toLocaleString()}** pièces transférées vers ton wallet (bot-coin).`)
            .addFields({ name: 'Solde mini-jeu', value: `${(coins - amount).toLocaleString()}`, inline: true }, { name: 'Wallet', value: `+${amount.toLocaleString()}`, inline: true })
            .setTimestamp();
        await message.reply({ embeds: [e] });
    },
};
