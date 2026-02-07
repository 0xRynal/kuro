const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'semiwlremove',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { getRandomNoPermission, getRandomWrongChannel, getRandomError, getRandomInvalidUsage, getRandomUserNotFound } = require('../utils/messages');
        
        const { canUse } = require('../utils/perms');
        
        if (!canUse(message.member, 'semiwlremove')) {
            return message.reply(getRandomNoPermission('wlremove', false));
        }

        // check args
        if (args.length < 1) {
            return message.reply(`❌ Utilisation: \`${config.prefix}semiwlremove @role|ID\``);
        }

        const roleId = args[0]?.replace(/\D/g, '') || message.mentions.roles?.first()?.id;
        const role = message.mentions.roles?.first() || (roleId ? message.guild.roles.cache.get(roleId) || await message.guild.roles.fetch(roleId).catch(() => null) : null);
        if (!role) return message.reply(getRandomUserNotFound());

        try {
            const { removeSemiWhitelistRole, isRoleSemiWhitelisted } = require('../utils/whitelist');
            
            // check if not semi-whitelisted
            if (!isRoleSemiWhitelisted(message.guild.id, role.id)) {
                return message.reply(`🤦‍♂️ Wsh frr le rôle ${role} n'est même pas dans la semi-whitelist, réfléchis 2 sec`);
            }

            // remove from semi-whitelist
            removeSemiWhitelistRole(message.guild.id, role.id);
            await message.reply(`✅ Le rôle ${role} a été retiré de la semi-whitelist.`);
        } catch (error) {
            console.error('Erreur lors du retrait du rôle de la semi-whitelist:', error);
            const { safeReply } = require('../utils/messages');
            await safeReply(message, getRandomError());
        }
    },
};
