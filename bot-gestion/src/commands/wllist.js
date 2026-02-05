const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'wllist',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { canUse } = require('../utils/perms');
        const { getRandomNoPermission, getRandomWrongChannel, getRandomError } = require('../utils/messages');
        
        if (!canUse(message.member, 'wllist')) {
            return message.reply(getRandomNoPermission('wllist', false));
        }

        try {
            // load whitelist
            const { loadWhitelist } = require('../utils/whitelist');
            const whitelistedRoleIds = loadWhitelist(message.guild.id);

            if (whitelistedRoleIds.length === 0) {
                return message.reply('📋 La whitelist est vide.');
            }

            // format roles
            const roles = whitelistedRoleIds
                .map(roleId => {
                    const role = message.guild.roles.cache.get(roleId);
                    return role ? role.toString() : `ID: ${roleId} (rôle introuvable)`;
                })
                .join('\n');

            await message.reply({
                embeds: [{
                    color: 0x00FF00,
                    title: '📋 Rôles dans la whitelist',
                    description: roles || 'Aucun rôle',
                    timestamp: new Date().toISOString(),
                }],
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage de la whitelist:', error);
            const { safeReply } = require('../utils/messages');
            await safeReply(message, getRandomError());
        }
    },
};
