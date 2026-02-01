const { PermissionFlagsBits } = require('discord.js');
const { get } = require('../utils/store');
const { isKuroBot } = require('../utils/kuroBots');

module.exports = { name: 'guildMemberAdd', async execute(member) {
    if (!member.user.bot) return;
    const g = get(member.guild.id);
    if (!g.antibot) return;
    if (isKuroBot(member.user.id) || g.botWhitelist.includes(member.user.id)) return;

    const me = member.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.KickMembers)) return;
    if (member.roles.highest.position >= me.roles.highest.position) return;

    try {
        await member.kick('Antibot: bots non autorisés');
        const ch = member.guild.systemChannel || member.guild.channels.cache.find(c => c.isTextBased());
        if (ch) await ch.send(`🛡️ **Antibot** : ${member.user.tag} (bot) a été expulsé.`).catch(() => {});
    } catch (err) {
        console.error('antibot:', err);
    }
}};
