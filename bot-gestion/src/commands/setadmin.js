const config = require('../config');

module.exports = {
    data: {
        name: 'setadmin',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { getRandomNoPermission, getRandomError, getRandomInvalidUsage, getRandomUserNotFound } = require('../utils/messages');
        
        const { full } = require('../utils/perms');
        
        const isOwner = message.author.id === message.guild.ownerId;
        const hasFullPerms = full(message.author.id, message.guild?.id);
        
        if (!isOwner && !hasFullPerms) {
            return message.reply(getRandomNoPermission('wladd', false));
        }

        // check args
        if (args.length < 1) {
            return message.reply(`❌ Utilisation: \`${config.prefix}setadmin @role\``);
        }

        // get role
        const role = message.mentions.roles.first();
        
        if (!role) {
            return message.reply(getRandomUserNotFound());
        }

        try {
            const { saveAdminRole, loadAdminRole } = require('../utils/whitelist');
            
            // get current admin role
            const currentAdminRoleId = loadAdminRole(message.guild.id);
            const currentAdminRole = currentAdminRoleId ? message.guild.roles.cache.get(currentAdminRoleId) : null;
            
            // save new admin role
            saveAdminRole(message.guild.id, role.id);
            
            let response = `✅ Le rôle ${role} a été défini comme rôle admin pour gérer les whitelists.`;
            if (currentAdminRole) {
                response += `\n(Ancien rôle admin: ${currentAdminRole})`;
            }
            
            await message.reply(response);
        } catch (error) {
            console.error('Erreur lors de la définition du rôle admin:', error);
            message.reply(getRandomError());
        }
    },
};
