const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'semiwllist',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { getRandomNoPermission, getRandomWrongChannel, getRandomError } = require('../utils/messages');
        
        const { canUse } = require('../utils/perms');
        
        if (!canUse(message.member, 'semiwllist')) {
            return message.reply(getRandomNoPermission('wllist', false));
        }

        try {
            // load semi-whitelist
            const { loadSemiWhitelist } = require('../utils/whitelist');
            const semiWhitelistedRoleIds = loadSemiWhitelist(message.guild.id);

            if (semiWhitelistedRoleIds.length === 0) {
                return message.reply('📋 La semi-whitelist est vide.');
            }

            // format roles
            const roles = semiWhitelistedRoleIds
                .map(roleId => {
                    const role = message.guild.roles.cache.get(roleId);
                    return role ? role.toString() : `ID: ${roleId} (rôle introuvable)`;
                })
                .join('\n');

            await message.reply({
                embeds: [{
                    color: 0xFFA500,
                    title: '📋 Rôles dans la semi-whitelist (mute uniquement)',
                    description: roles || 'Aucun rôle',
                    timestamp: new Date().toISOString(),
                }],
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage de la semi-whitelist:', error);
            const { safeReply } = require('../utils/messages');
            await safeReply(message, getRandomError());
        }
    },
};
