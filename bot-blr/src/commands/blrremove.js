const config = require('../config');
const { removeUser, isBlacklisted } = require('../utils/blr');

module.exports = {
    data: { name: 'blrremove' },
    async execute(message, args) {
        if (!message.guild) return;
        const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
        let userId = message.mentions.members?.first()?.id || message.mentions.users?.first()?.id;
        if (!userId && args[0]?.match(/^\d{17,19}$/)) userId = args[0];
        if (!userId) return message.reply(`❌ Usage: \`${config.prefix}blrremove @user\` ou \`${config.prefix}blrremove <userID>\``);
        if (!isBlacklisted(message.guild.id, userId)) return message.reply('❌ Cet utilisateur n\'est pas blacklisté.');
        removeUser(message.guild.id, userId);
        return message.reply(`✅ Utilisateur retiré de la blrole.`);
    },
};
