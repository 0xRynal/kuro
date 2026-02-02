const config = require('../config');
const { full } = require('../utils/perms');
const { removeRolePerm, VALID_PERMS } = require('../utils/rolePerms');

module.exports = {
    data: { name: 'rperm' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!full(message.author.id, message.guild.id)) return message.reply('❌ Full perm requis.');
        if (args.length < 2) return message.reply(`❌ Usage: \`${config.prefix}rperm @role <perm>\`\nPerms: ${VALID_PERMS.join(', ')}`);
        const role = message.mentions.roles.first();
        if (!role) return message.reply('❌ Mentionne un rôle.');
        const perm = args[1].toLowerCase();
        if (!VALID_PERMS.includes(perm)) return message.reply(`❌ Perm invalide. Valides: ${VALID_PERMS.join(', ')}`);
        removeRolePerm(message.guild.id, role.id, perm);
        await message.reply(`✅ ${role} ne peut plus utiliser \`${config.prefix}${perm}\`.`);
    },
};
