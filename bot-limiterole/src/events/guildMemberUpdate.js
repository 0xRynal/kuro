const { load } = require('../utils/limits');

module.exports = { name: 'guildMemberUpdate', async execute(oldMember, newMember) {
    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    if (!added.size) return;
    const limits = load(newMember.guild.id);

    for (const [roleId, max] of Object.entries(limits)) {
        if (!added.has(roleId)) continue;
        const role = newMember.guild.roles.cache.get(roleId);
        if (!role) continue;
        if (role.members.size <= max) continue;
        try {
            await newMember.roles.remove(role, 'Limiterole: limite atteinte');
            const ch = newMember.guild.systemChannel || newMember.guild.channels.cache.find(c => c.isTextBased());
            if (ch) await ch.send(`⚠️ ${newMember}, le rôle ${role} est limité à ${max}.`).catch(() => {});
        } catch (e) {
            console.error('Limiterole:', e);
        }
    }
}};
