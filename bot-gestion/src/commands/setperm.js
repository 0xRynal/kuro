const config = require('../config');
const { full } = require('../utils/perms');
const { addRolePerm, VALID_PERMS } = require('../utils/rolePerms');

module.exports = {
    data: { name: 'setperm' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!full(message.author.id, message.guild.id)) return message.reply('❌ Full perm requis.');
        if (args.length < 2) return message.reply(`❌ Usage: \`${config.prefix}setperm @role|ID <perm>\`\nPerms: ${VALID_PERMS.join(', ')}`);
        const roleId = args[0]?.replace(/\D/g, '') || message.mentions.roles?.first()?.id;
        const role = message.mentions.roles?.first() || (roleId ? message.guild.roles.cache.get(roleId) || await message.guild.roles.fetch(roleId).catch(() => null) : null);
        if (!role) return message.reply('❌ Rôle introuvable.');
        const perm = args[1].toLowerCase();
        if (!VALID_PERMS.includes(perm)) return message.reply(`❌ Perm invalide. Valides: ${VALID_PERMS.join(', ')}`);
        addRolePerm(message.guild.id, role.id, perm);
        await message.reply(`✅ ${role} peut maintenant utiliser \`${config.prefix}${perm}\`.`);
    },
};
