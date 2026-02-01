const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    const p = config.prefix;
    await message.reply({
        embeds: [{
            color: 0x5865F2,
            title: '📖 Limiterole',
            fields: [
                { name: `${p}setlimit @rôle <nb>`, value: 'Limite le nombre de membres pour ce rôle', inline: false },
                { name: `${p}unlimit @rôle`, value: 'Supprime la limite', inline: false },
                { name: `${p}limits`, value: 'Liste les limites configurées', inline: false },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
}};
