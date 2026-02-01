const config = require('../config');

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;
        if (message.mentions.users.has(message.client.user?.id) && !message.content.startsWith(config.prefix)) {
            const helpCmd = message.client.commands?.get('help');
            if (helpCmd) { try { helpCmd.execute(message, []); } catch (e) { console.error('stats', e); } return; }
        }
        if (!message.content.startsWith(config.prefix)) return;
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const cmd = message.client.commands.get(args.shift().toLowerCase());
        if (!cmd) return;
        try { cmd.execute(message, args); } catch (e) { console.error('coin', e); message.reply('❌ Erreur.').catch(() => {}); }
    },
};
