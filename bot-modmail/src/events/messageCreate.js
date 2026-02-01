const config = require('../config');
const { PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { getByChannel, getByUser, create } = require('../utils/tickets');

function isStaff(member) {
    if (!member) return false;
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    if (member.permissions.has(PermissionFlagsBits.ManageGuild)) return true;
    if (config.staffRoleIds.length && config.staffRoleIds.some(rid => member.roles.cache.has(rid))) return true;
    return false;
}

const DEBUG = false;
function log(...a) { if (DEBUG) console.log('[modmail]', ...a); }

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        log('Message reçu:', message.author?.tag, '| guild:', !!message.guild, '| DM:', !message.guild, '| content:', (message.content || '').slice(0, 50));
        if (message.author.bot) return;

        // DM reçue
        if (!message.guild) {
            log('→ DM détectée');
            if (message.content.startsWith(config.prefix)) {
                log('→ prefix, commande...');
                const args = message.content.slice(config.prefix.length).trim().split(/ +/);
                const cmd = message.client.commands.get(args.shift()?.toLowerCase());
                if (cmd) {
                    try { await cmd.execute(message, args); } catch (e) { console.error('modmail', e); }
                    return;
                }
            }
            try {
                await handleDM(message);
            } catch (e) {
                console.error('[modmail] handleDM erreur:', e);
                message.reply('❌ Erreur lors de la création du ticket.').catch(() => {});
            }
            return;
        }

        // Ping → help
        if (message.mentions.users.has(message.client.user?.id) && !message.content.startsWith(config.prefix)) {
            const helpCmd = message.client.commands?.get('help');
            if (helpCmd) { try { await helpCmd.execute(message, []); } catch (e) { console.error('modmail', e); } return; }
        }
        // Commandes (prefix)
        if (message.content.startsWith(config.prefix)) {
            const args = message.content.slice(config.prefix.length).trim().split(/ +/);
            const cmd = message.client.commands.get(args.shift()?.toLowerCase());
            if (cmd) {
                try { await cmd.execute(message, args); } catch (e) { console.error('modmail', e); }
                return;
            }
        }

        // Message dans un channel ticket → forward au user
        const ticket = getByChannel(message.channel.id);
        if (ticket && !ticket.closed && isStaff(message.member)) {
            return forwardToUser(message, ticket);
        }
    },
};

async function handleDM(message) {
    log('handleDM: userId=', message.author.id, 'guildId=', config.guildId);
    const ticket = getByUser(message.author.id);
    log('handleDM: ticket existant?', !!ticket);
    let guild = config.guildId
        ? message.client.guilds.cache.get(config.guildId)
        : message.client.guilds.cache.first();
    if (!guild && config.guildId) {
        log('handleDM: guild pas en cache, fetch...');
        try { guild = await message.client.guilds.fetch(config.guildId); } catch (e) { console.error('modmail fetch guild:', e); }
    }
    log('handleDM: guild trouvé?', !!guild, guild?.name);
    if (!guild) return message.reply('❌ Aucun serveur configuré (MODMAIL_GUILD_ID invalide ou bot pas sur le serveur).');

    if (ticket) {
        log('handleDM: ticket existant, forward vers channel', ticket.channelId);
        const channel = guild.channels.cache.get(ticket.channelId);
        if (channel) {
            const emb = new EmbedBuilder()
                .setColor(0x5865F2)
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription(message.content || '*[Pièce jointe]*')
                .setTimestamp();
            if (message.attachments.size) {
                emb.setImage(message.attachments.first()?.url);
            }
            await channel.send({ embeds: [emb] });
            if (message.content) await message.react('✅').catch(() => {});
        }
        return;
    }

    log('handleDM: création nouveau ticket...');
    const category = config.categoryId ? guild.channels.cache.get(config.categoryId) : null;
    const overwrites = [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: message.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ];
    for (const rid of config.staffRoleIds) {
        if (rid) overwrites.push({ id: rid, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
    }
    log('handleDM: guild.channels.create...');
    const channel = await guild.channels.create({
        name: `ticket-${message.author.username}-${Date.now().toString(36).slice(-4)}`,
        type: ChannelType.GuildText,
        parent: category?.id,
        topic: `Modmail | ${message.author.tag} (${message.author.id})`,
        permissionOverwrites: overwrites,
    });
    log('handleDM: channel créé', channel.id, channel.name);

    const t = create(message.author.id, channel.id, guild.id);
    log('handleDM: ticket sauvegardé');
    const welcome = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('📩 Nouveau ticket')
        .setDescription(`**${message.author}** (${message.author.tag}) a ouvert un ticket.\nUtilisez ce channel pour répondre. \`${config.prefix}close\` pour fermer.`)
        .addFields(
            { name: 'Premier message', value: message.content || '*[Pièce jointe]*', inline: false },
        )
        .setTimestamp();
    if (message.attachments.size) welcome.setImage(message.attachments.first()?.url);
    await channel.send({ embeds: [welcome] });

    const staffRoles = config.staffRoleIds.map(rid => guild.roles.cache.get(rid)).filter(Boolean);
    if (staffRoles.length) {
        await channel.send({ content: staffRoles.map(r => r.toString()).join(' ') }).catch(() => {});
    }

    await message.reply('✅ Ton message a été envoyé au staff. Tu recevras les réponses ici en DM.');
    log('handleDM: ✅ ticket créé et reply envoyé');
}

async function forwardToUser(message, ticket) {
    try {
        const user = await message.client.users.fetch(ticket.userId);
        const emb = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setDescription(`**Réponse du staff:**\n\n${message.content}`)
            .setFooter({ text: 'Modmail' })
            .setTimestamp();
        await user.send({ embeds: [emb] });
        await message.react('✅').catch(() => {});
    } catch (e) {
        await message.reply('❌ Impossible d\'envoyer le DM à l\'utilisateur (DMs fermés?).').catch(() => {});
    }
}
