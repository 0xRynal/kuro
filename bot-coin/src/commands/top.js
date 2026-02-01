const { get, load } = require('../utils/wallets');

module.exports = {
    data: { name: 'top' },
    async execute(message, args) {
        const w = load();
        const entries = Object.entries(w)
            .map(([id, u]) => ({ id, bal: u.balance ?? 0 }))
            .filter(e => e.bal > 0)
            .sort((a, b) => b.bal - a.bal)
            .slice(0, 10);
        if (!entries.length) return message.reply('📋 Aucun solde.');
        const lines = [];
        for (let i = 0; i < entries.length; i++) {
            const u = await message.client.users.fetch(entries[i].id).catch(() => null);
            lines.push(`${i + 1}. ${u ? u.tag : entries[i].id}: **${entries[i].bal.toLocaleString()}**`);
        }
        await message.reply({
            embeds: [{ color: 0xFFD700, title: '🏆 Top coins', description: lines.join('\n'), timestamp: new Date().toISOString() }],
        });
    },
};
