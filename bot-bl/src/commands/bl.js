const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { get, add, hasLevel, LEVELS } = require('../utils/bl');

module.exports = { data: { name: 'bl' }, async execute(message, args) {
    if (!message.guild) return;
    const ids = (process.env.FULL_PERM_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(message.author.id)) return message.reply('❌ Permission requise.');
    const gid = message.guild.id;

    if (args.length === 0) {
        const list = get(gid);
        if (!list.length) return message.reply('📋 Blacklist vide.');
        const lines = list.slice(0, 25).map(e => {
            const lvls = e.levels.map(l => `**Niv.${l.level}** (${l.reason})`).join(' · ');
            return `• <@${e.userId}> — ${lvls}`;
        });
        return message.reply({
            embeds: [{
                color: 0x2C2F33,
                title: '📋 Blacklist',
                description: lines.join('\n') + (list.length > 25 ? '\n...' : ''),
                footer: { text: '!bbl @user 1|2|3 [raison] · !bunbl @user 1|2|3' },
                timestamp: new Date().toISOString(),
            }],
        });
    }

    let target = message.mentions.users.first() || (args[0] && /^\d{17,19}$/.test(args[0]) ? { id: args[0], tag: args[0] } : null);
    if (!target) return message.reply(`❌ \`${config.prefix}bl @user|ID <1|2|3> [raison]\`\nEx: \`${config.prefix}bl 123456789012345678 2 raid\``);

    if (target.id === message.author.id) return message.reply('❌ Tu ne peux pas te blacklister.');
    if (typeof target.bot === 'undefined') {
        try { target = await message.client.users.fetch(target.id); } catch { target = { ...target, bot: false }; }
    }
    if (target.bot) return message.reply('❌ On ne blacklist pas les bots.');

    const levelArg = args[1];
    const level = parseInt(levelArg, 10);
    if (!levelArg || ![1, 2, 3].includes(level)) return message.reply(`❌ Niveau requis: 1, 2 ou 3\n**1** = Pedo / Pub MP / Insultes\n**2** = Raid / Token\n**3** = Dox / Leak`);

    const reason = args.slice(2).join(' ') || 'Non spécifié';

    if (hasLevel(gid, target.id, level)) return message.reply(`❌ Déjà blacklisté pour le niveau ${level}.`);

    add(gid, target.id, level, reason, message.author.id);

    try {
        if (message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            await message.guild.members.ban(target.id, { reason: `BL Niv.${level} par ${message.author.tag}: ${reason}` });
            await message.reply(`✅ ${target.tag || target.id} blacklisté **Niveau ${level}** et banni.`);
        } else {
            await message.reply(`✅ ${target.tag || target.id} blacklisté **Niveau ${level}**.`);
        }
    } catch (e) {
        await message.reply(`✅ ${target.tag || target.id} blacklisté **Niveau ${level}**.`);
    }
}};
