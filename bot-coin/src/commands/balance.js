const { get } = require('../utils/wallets');

module.exports = {
    data: { name: 'balance' },
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const u = get(target.id);
        const bal = u.balance ?? 0;
        await message.reply({
            embeds: [{
                color: 0xFFD700,
                title: '💰 Balance',
                description: `${target} a **${bal.toLocaleString()}** coins.`,
                thumbnail: { url: target.displayAvatarURL() },
                timestamp: new Date().toISOString(),
            }],
        });
    },
};
