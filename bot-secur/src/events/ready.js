const { ActivityType } = require('discord.js');
const { joinVoiceOnReady } = require('../../../utils/joinVoice');

module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} connecté`);
        joinVoiceOnReady(client);
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
