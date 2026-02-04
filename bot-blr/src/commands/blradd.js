const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { addUser, isBlacklisted, getRolesWithPerms } = require('../utils/blr');

module.exports = {
    data: { name: 'blradd' },
    async execute(message, args) {
        if (!message.guild) return;
        const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
        const target = message.mentions.members?.first() || (args[0]?.match(/^\d{17,19}$/) ? await message.guild.members.fetch(args[0]).catch(() => null) : null);
        if (!target) return message.reply(`❌ Usage: \`${config.prefix}blradd @user\` ou \`${config.prefix}blradd <userID>\``);
        if (target.id === message.client.user.id) return message.reply('❌ Non.');
        if (isBlacklisted(message.guild.id, target.id)) return message.reply(`❌ ${target} déjà blacklisté.`);
        addUser(message.guild.id, target.id);

        const roleIds = getRolesWithPerms(message.guild);
        const toRemove = target.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id && roleIds.includes(r.id));
        const me = message.guild.members.me;
        if (toRemove.size && me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            for (const role of toRemove.values()) {
                if (role.position >= me.roles.highest.position) continue;
                try {
                    await target.roles.remove(role, 'BLRole: user blacklisté');
                } catch {}
            }
        }
        return message.reply(`✅ ${target} blacklisté (blrole). Rôles avec perms retirés.`);
    },
};
