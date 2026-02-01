const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    const p = config.prefix;
    await message.reply({
        embeds: [{
            color: 0x2C2F33,
            title: '📋 BLRole',
            fields: [
                { name: `${p}blradd @role`, value: 'Blacklister un rôle', inline: false },
                { name: `${p}blrremove @role`, value: 'Retirer de la blrole', inline: false },
                { name: `${p}blrlist`, value: 'Liste des rôles blacklistés', inline: false },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
}};
