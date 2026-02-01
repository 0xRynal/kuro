const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'semiwlremove',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { getRandomNoPermission, getRandomWrongChannel, getRandomError, getRandomInvalidUsage, getRandomUserNotFound } = require('../utils/messages');
        
        const { staff } = require('../utils/perms');
        
        if (!staff(message.member)) {
            return message.reply(getRandomNoPermission('wlremove', false));
        }

        // check args
        if (args.length < 1) {
            return message.reply(`❌ Utilisation: \`${config.prefix}semiwlremove @role\``);
        }

        // get role
        const role = message.mentions.roles.first();
        
        if (!role) {
            return message.reply(getRandomUserNotFound());
        }

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
            message.reply(getRandomError());
        }
    },
};
