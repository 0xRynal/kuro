const { EmbedBuilder } = require('discord.js');

function countVoice(guild) {
    let n = 0;
    for (const ch of guild.channels.cache.values()) {
        if (ch.isVoiceBased() && ch.members) n += ch.members.size;
    }
    return n;
}

module.exports = { data: { name: 'stats' }, async execute(message, args) {
    const g = message.guild;
    const members = g.memberCount;
    const voc = countVoice(g);
    const bots = g.members.cache.filter(m => m.user.bot).size;
    const humans = members - bots;

    const e = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📊 ${g.name}`)
        .setThumbnail(g.iconURL())
        .addFields(
            { name: '👥 Membres', value: String(members), inline: true },
            { name: '🙂 Humains', value: String(humans), inline: true },
            { name: '🤖 Bots', value: String(bots), inline: true },
            { name: '🔊 En vocal', value: String(voc), inline: true },
        )
        .setTimestamp();
    await message.reply({ embeds: [e] });
}};
