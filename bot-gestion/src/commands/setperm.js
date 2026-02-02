const config = require('../config');
const { full } = require('../utils/perms');
const { addRolePerm, VALID_PERMS } = require('../utils/rolePerms');

module.exports = {
    data: { name: 'setperm' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!full(message.author.id, message.guild.id)) return message.reply('❌ Full perm requis.');
        if (args.length < 2) return message.reply(`❌ Usage: \`${config.prefix}setperm @role <perm>\`\nPerms: ${VALID_PERMS.join(', ')}`);
        const role = message.mentions.roles.first();
        if (!role) return message.reply('❌ Mentionne un rôle.');
        const perm = args[1].toLowerCase();
        if (!VALID_PERMS.includes(perm)) return message.reply(`❌ Perm invalide. Valides: ${VALID_PERMS.join(', ')}`);
        addRolePerm(message.guild.id, role.id, perm);
        await message.reply(`✅ ${role} peut maintenant utiliser \`${config.prefix}${perm}\`.`);
    },
};
