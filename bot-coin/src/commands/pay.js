const config = require('../config');
const { get, add } = require('../utils/wallets');

module.exports = {
    data: { name: 'pay' },
    async execute(message, args) {
        if (!message.guild) return;
        const target = message.mentions.users.first();
        const amount = parseInt(args[1], 10);
        if (!target || target.bot || !Number.isInteger(amount) || amount < 1) {
            return message.reply(`❌ Utilisation: \`${require('../config').prefix}pay @user <montant>\``);
        }
        if (target.id === message.author.id) {
            return message.reply('❌ Tu peux pas te payer toi-même frr.');
        }
        const tax = Math.floor(amount * config.taxPay);
        const net = amount - tax;
        const sender = get(message.author.id);
        if ((sender.balance ?? 0) < amount) {
            return message.reply(`❌ Solde insuffisant. Tu as **${(sender.balance ?? 0).toLocaleString()}** coins.`);
        }
        add(message.author.id, -amount);
        add(target.id, net);
        await message.reply(`✅ **${amount.toLocaleString()}** coins envoyés à ${target} (taxe **${tax}** coins 💸).`);
    },
};
