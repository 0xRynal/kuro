const config = require('../config');
const { get, set, add } = require('../utils/wallets');

module.exports = {
    data: { name: 'daily' },
    async execute(message, args) {
        const u = get(message.author.id);
        const now = Date.now();
        const last = u.lastDaily || 0;
        const elapsed = now - last;
        if (last && elapsed < config.dailyCooldownMs) {
            const rest = Math.ceil((config.dailyCooldownMs - elapsed) / (60 * 60 * 1000));
            return message.reply(`❌ Daily dans **${rest}h**.`);
        }
        let reward = config.dailyBase;
        if (Math.random() < 0.15) {
            const impôt = Math.floor(reward * 0.3);
            reward -= impôt;
            await message.reply(`💸 Daily **${reward.toLocaleString()}** coins (impôt -${impôt} 🙄).`);
        } else {
            await message.reply(`💰 Daily **${reward.toLocaleString()}** coins.`);
        }
        add(message.author.id, reward);
        set(message.author.id, { lastDaily: now });
    },
};
