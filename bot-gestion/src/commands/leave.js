const config = require('../config');

module.exports = {
    data: {
        name: 'leave',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { hasFullPermissions } = require('../utils/whitelist');
        const { getRandomNoPermission, getRandomError } = require('../utils/messages');
        
        const hasFullPerms = hasFullPermissions(message.author.id, message.guild?.id);
        
        if (!hasFullPerms) {
            return message.reply(getRandomNoPermission('leave', false));
        }

        try {
            await message.reply('👋 Le bot quitte le serveur...');
            await message.guild.leave();
        } catch (error) {
            console.error('Erreur lors du leave:', error);
            message.reply(getRandomError());
        }
    },
};
