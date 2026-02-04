const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    const p = config.prefix;
    await message.reply({
        embeds: [{
            color: 0x2C2F33,
            title: '📋 BLRole',
            fields: [
                { name: `${p}blradd @user`, value: 'Blacklister un user (retire tous les rôles avec perms)', inline: false },
                { name: `${p}blrremove @user`, value: 'Retirer de la blrole', inline: false },
                { name: `${p}blrlist`, value: 'Liste des users blacklistés', inline: false },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
}};
