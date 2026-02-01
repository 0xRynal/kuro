const config = require('../config');
const { removeRoleThreshold } = require('../utils/autorank');

module.exports = { data: { name: 'unsetrank' }, async execute(message, args) {
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
    const at = parseInt(args[0], 10);
    if (!Number.isInteger(at) || at < 1) return message.reply(`❌ Utilisation: \`${config.prefix}unsetrank <messages>\` Ex: \`${config.prefix}unsetrank 100\``);

    removeRoleThreshold(message.guild.id, at);
    return message.reply(`✅ Seuil ${at} messages supprimé.`);
}};
