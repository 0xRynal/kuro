const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

module.exports = {
    data: {
        name: 'wllist',
    },
    async execute(message, args) {
        if (!message.guild) return;
        const { getRandomNoPermission, getRandomWrongChannel, getRandomError } = require('../utils/messages');
        
        const { hasFullPermissions, hasAdminRole } = require('../utils/whitelist');
        
        // check full permissions first
        const hasFullPerms = hasFullPermissions(message.author.id, message.guild?.id);
        
        // check perm user
        const hasPermission = message.member.permissions.has([PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.Administrator]);
        const hasAdmin = hasAdminRole(message.member);
        if (!hasPermission && !hasFullPerms && !hasAdmin) {
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
            message.reply(getRandomError());
        }
    },
};
