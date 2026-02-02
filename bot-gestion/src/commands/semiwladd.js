const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'semiwladd',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { getRandomNoPermission, getRandomWrongChannel, getRandomError, getRandomInvalidUsage, getRandomUserNotFound, getRandomAlclientReadyWhitelisted } = require('../utils/messages');
        
        const { canUse } = require('../utils/perms');
        
        if (!canUse(message.member, 'semiwladd')) {
            return message.reply(getRandomNoPermission('wladd', false));
        }

        // check args
        if (args.length < 1) {
            return message.reply(`❌ Utilisation: \`${config.prefix}semiwladd @role\``);
        }

        // get role
        const role = message.mentions.roles.first();
        
        if (!role) {
            return message.reply(getRandomUserNotFound());
        }

        try {
            const { addSemiWhitelistRole, isRoleSemiWhitelisted } = require('../utils/whitelist');
            
            // check if alclientReady semi-whitelisted
            if (isRoleSemiWhitelisted(message.guild.id, role.id)) {
                return message.reply(`🤦‍♂️ Wsh frr le rôle ${role} est déjà dans la semi-whitelist, réfléchis 2 sec`);
            }

            // add to semi-whitelist
            addSemiWhitelistRole(message.guild.id, role.id);
            await message.reply(`✅ Le rôle ${role} a été ajouté à la semi-whitelist (mute uniquement).`);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du rôle à la semi-whitelist:', error);
            message.reply(getRandomError());
        }
    },
};
