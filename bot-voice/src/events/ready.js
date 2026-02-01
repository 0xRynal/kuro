const { ActivityType } = require('discord.js');
const { load, updateChannels } = require('../utils/statsChannels');
const { joinVoiceOnReady } = require('../../../utils/joinVoice');
const config = require('../config');

const UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 min

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

        setInterval(() => {
            const d = load();
            const guilds = d.guilds || {};
            for (const [guildId, cfg] of Object.entries(guilds)) {
                const guild = client.guilds.cache.get(guildId);
                if (guild) updateChannels(guild, cfg, config.inviteCode).catch(() => {});
            }
        }, UPDATE_INTERVAL_MS);
    },
};
