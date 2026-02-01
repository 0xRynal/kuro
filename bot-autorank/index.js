try { require('dotenv').config(); } catch (_) {}
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.commands = new Collection();
const cp = path.join(__dirname, 'src', 'commands');
for (const f of fs.readdirSync(cp).filter(f => f.endsWith('.js'))) {
    const c = require(path.join(cp, f));
    if (c.data && c.execute) client.commands.set(c.data.name, c);
}
const ep = path.join(__dirname, 'src', 'events');
for (const f of fs.readdirSync(ep).filter(f => f.endsWith('.js'))) {
    const e = require(path.join(ep, f));
    if (e.once) client.once(e.name, (...a) => e.execute(...a));
    else client.on(e.name, (...a) => e.execute(...a));
}

client.login(config.token);
