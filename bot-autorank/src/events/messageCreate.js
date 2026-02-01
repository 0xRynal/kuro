const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { incCount, getRoles } = require('../utils/autorank');

async function checkRanks(message) {
    if (message.author.bot) return;
    const gid = message.guild?.id;
    if (!gid) return;
    const count = incCount(gid, message.author.id);
    const roles = getRoles(gid);
    if (!roles.length) return;
    const me = message.guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) return;
    let member;
    try { member = await message.guild.members.fetch(message.author.id); } catch { return; }
    for (const { at, roleId } of roles) {
        if (count < at) continue;
        const role = message.guild.roles.cache.get(roleId);
        if (!role || role.position >= me.roles.highest.position) continue;
        if (member.roles.cache.has(roleId)) continue;
        try { await member.roles.add(role, 'Autorank'); } catch (e) { console.error('autorank:', e); }
    }
}

module.exports = { name: 'messageCreate', async execute(message) {
    if (message.author.bot) return;
    checkRanks(message).catch(() => {});
    if (message.mentions.users.has(message.client.user?.id) && !message.content.startsWith(config.prefix)) {
        const helpCmd = message.client.commands?.get('help');
        if (helpCmd) { try { await helpCmd.execute(message, []); } catch (e) { console.error('autorank', e); } return; }
    }
    if (!message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const cmd = message.client.commands.get(args.shift()?.toLowerCase());
    if (cmd) try { await cmd.execute(message, args); } catch (e) { console.error('autorank', e); message.reply('❌ Erreur.').catch(() => {}); }
}};
