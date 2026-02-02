const config = require('../config');
const { full } = require('../utils/perms');
const { getRolePerms } = require('../utils/rolePerms');

module.exports = {
    data: { name: 'listperms' },
    async execute(message, args) {
        if (!message.guild) return;
        if (!full(message.author.id, message.guild.id)) return message.reply('❌ Full perm requis.');
        const data = getRolePerms(message.guild.id);
        const perms = Object.keys(data);
        if (!perms.length) return message.reply('📋 Aucune perm assignée (rôles vides).');
        const lines = perms.map(perm => {
            const roleIds = data[perm];
            const roles = roleIds.map(rid => {
                const r = message.guild.roles.cache.get(rid);
                return r ? r.toString() : `\`${rid}\``;
            }).join(', ');
            return `**${perm}** → ${roles}`;
        });
        const txt = lines.join('\n').slice(0, 1900);
        await message.reply({
            embeds: [{
                color: 0x5865F2,
                title: '📋 Perms assignées',
                description: txt,
                timestamp: new Date().toISOString(),
            }],
        });
    },
};
