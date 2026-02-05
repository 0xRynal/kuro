const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'wladd',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { getRandomNoPermission, getRandomWrongChannel, getRandomError, getRandomInvalidUsage, getRandomUserNotFound, getRandomAlclientReadyWhitelisted } = require('../utils/messages');
        
        const { canUse } = require('../utils/perms');
        
        if (!canUse(message.member, 'wladd')) {
            return message.reply(getRandomNoPermission('wladd', false));
        }

        // check args
        if (args.length < 1) {
            return message.reply(getRandomInvalidUsage('wladd'));
        }

        // get role
        const role = message.mentions.roles.first();
        
        if (!role) {
            return message.reply(getRandomUserNotFound());
        }

        try {
            const { addRole, isRoleWhitelisted } = require('../utils/whitelist');
            
            // check if alclientReady whitelisted
            if (isRoleWhitelisted(message.guild.id, role.id)) {
                return message.reply(getRandomAlclientReadyWhitelisted(role));
            }

            // add to whitelist
            addRole(message.guild.id, role.id);
            await message.reply(`✅ Le rôle ${role} a été ajouté à la whitelist.`);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du rôle à la whitelist:', error);
            const { safeReply } = require('../utils/messages');
            await safeReply(message, getRandomError());
        }
    },
};
