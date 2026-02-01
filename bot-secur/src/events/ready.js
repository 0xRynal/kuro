const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} connecté`);
        client.user.setPresence({
            activities: [{
                type: ActivityType.Watching,
                name: 'discord.gg/kuronai',
                state: 'https://guns.lol/0xRynal',
            }],
            status: 'online',
        });
    },
};
