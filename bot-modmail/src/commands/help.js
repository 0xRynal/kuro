const config = require('../config');

module.exports = {
    data: { name: 'help' },
    async execute(message) {
        const p = config.prefix;
        const isGuild = !!message.guild;
        if (!isGuild) {
            return message.reply(
                '**Modmail** — Envoie un message ici pour contacter le staff.\n' +
                'Tu recevras les réponses en DM.\n' +
                'Un nouveau ticket est créé automatiquement à ton premier message.'
            );
        }
        await message.reply({
            embeds: [{
                color: 0x5865F2,
                title: '📩 Modmail',
                fields: [
                    { name: `${p}close [raison]`, value: 'Ferme le ticket et supprime le channel', inline: false },
                    { name: `${p}tickets`, value: 'Liste des tickets ouverts', inline: false },
                    { name: `${p}set <guild|category|log|staff> <id>`, value: 'Configurer (admin)', inline: false },
                ],
                footer: { text: 'Les messages dans un ticket sont envoyés en DM à l\'utilisateur.' },
                timestamp: new Date().toISOString(),
            }],
        });
    },
};
