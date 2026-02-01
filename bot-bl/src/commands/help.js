const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    const p = config.prefix;
    const { LEVELS } = require('../utils/bl');
    await message.reply({
        embeds: [{
            color: 0x2C2F33,
            title: '📋 Bot BL',
            fields: [
                { name: 'Commandes', value: `\`${p}bl\` — Liste\n\`${p}bl @user <1|2|3> [raison]\` — Blacklister\n\`${p}unbl @user <1|2|3>\` — Retirer un niveau\n\`${p}set log <id>\` — Config log (admin)`, inline: false },
                { name: 'Niveau 1', value: 'Pedo / Pub MP (grab) / Insultes répétées / Sanctions', inline: false },
                { name: 'Niveau 2', value: 'Tentative raid / Token / Raid perm', inline: false },
                { name: 'Niveau 3', value: 'Dox / Leak / Autre', inline: false },
            ],
            timestamp: new Date().toISOString(),
        }],
    });
}};
