const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    const p = config.prefix;
    await message.reply({
        embeds: [{
            color: 0x5865F2,
            title: '📊 Autorank',
            fields: [
                { name: `${p}setrank <messages> @role`, value: 'Ex: ?setrank 100 @Staff', inline: false },
                { name: `${p}unsetrank <messages>`, value: 'Supprimer un seuil', inline: false },
                { name: `${p}ranks [@user]`, value: 'Voir seuils et progression', inline: false },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
}};
