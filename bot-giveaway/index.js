const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const ms = require('ms');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites
    ]
});

client.on('error', (err) => console.error('[giveaway] Client error:', err.message));

const INVITES_FILE = path.join(__dirname, 'data', 'invites.json');
const GIVEAWAYS_FILE = path.join(__dirname, 'data', 'giveaways.json');

async function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

async function loadInvites() {
    try {
        const data = await fs.readFile(INVITES_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveInvites(data) {
    await fs.writeFile(INVITES_FILE, JSON.stringify(data, null, 2));
}

async function loadGiveaways() {
    try {
        const data = await fs.readFile(GIVEAWAYS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveGiveaways(data) {
    await fs.writeFile(GIVEAWAYS_FILE, JSON.stringify(data, null, 2));
}

const inviteCache = new Map();

async function initInviteCache(guild) {
    try {
        const invites = await guild.invites.fetch();
        const cache = {};
        for (const [code, invite] of invites) {
            cache[code] = {
                uses: invite.uses || 0,
                inviterId: invite.inviter?.id
            };
        }
        inviteCache.set(guild.id, cache);
    } catch (error) {
        console.error(`Erreur lors de l'initialisation du cache pour ${guild.id}:`, error);
    }
}

async function trackInvite(member) {
    const invites = await loadInvites();
    const guild = member.guild;
    
    if (!inviteCache.has(guild.id)) {
        await initInviteCache(guild);
        return;
    }
    
    const oldCache = inviteCache.get(guild.id);
    
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const currentInvites = await guild.invites.fetch();
        const newCache = {};
        let inviteFound = false;
        
        for (const [code, invite] of currentInvites) {
            const oldInvite = oldCache[code];
            const inviterId = invite.inviter?.id;
            const currentUses = invite.uses || 0;
            const oldUses = oldInvite?.uses || 0;
            
            if (!oldInvite && inviterId && inviterId !== member.user.id && currentUses > 0) {
                const inviteKey = `${guild.id}_${inviterId}`;
                if (!invites[inviteKey]) {
                    invites[inviteKey] = {
                        userId: inviterId,
                        guildId: guild.id,
                        totalInvites: 0,
                        invites: {}
                    };
                }
                
                const memberKey = `${member.id}_${inviterId}`;
                const existingInvite = invites[inviteKey].invites[memberKey];
                
                if (!existingInvite) {
                    invites[inviteKey].invites[memberKey] = {
                        memberId: member.id,
                        timestamp: Date.now(),
                        active: true
                    };
                    try {
                        await guild.members.fetch(member.id);
                        invites[inviteKey].totalInvites++;
                        inviteFound = true;
                        console.log(`[INVITE] ${inviterId} a invité ${member.id} via nouvelle invite ${code}`);
                    } catch {
                        inviteFound = true;
                    }
                } else if (!existingInvite.active) {
                    existingInvite.active = true;
                    existingInvite.timestamp = Date.now();
                    try {
                        await guild.members.fetch(member.id);
                        invites[inviteKey].totalInvites++;
                        inviteFound = true;
                        console.log(`[INVITE] ${inviterId} - ${member.id} est revenu, invite réactivée (compteur: ${invites[inviteKey].totalInvites})`);
                    } catch {
                    }
                } else {
                    inviteFound = true;
                }
            }
            else if (oldInvite && inviterId && inviterId !== member.user.id && currentUses > oldUses) {
                const inviteKey = `${guild.id}_${inviterId}`;
                if (!invites[inviteKey]) {
                    invites[inviteKey] = {
                        userId: inviterId,
                        guildId: guild.id,
                        totalInvites: 0,
                        invites: {}
                    };
                }
                
                const memberKey = `${member.id}_${inviterId}`;
                const existingInvite = invites[inviteKey].invites[memberKey];
                
                if (!existingInvite) {
                    invites[inviteKey].invites[memberKey] = {
                        memberId: member.id,
                        timestamp: Date.now(),
                        active: true
                    };
                    try {
                        await guild.members.fetch(member.id);
                        invites[inviteKey].totalInvites++;
                        inviteFound = true;
                        console.log(`[INVITE] ${inviterId} a invité ${member.id} via invite ${code} (uses: ${oldUses} -> ${currentUses})`);
                    } catch {
                        inviteFound = true;
                    }
                } else if (!existingInvite.active) {
                    existingInvite.active = true;
                    existingInvite.timestamp = Date.now();
                    try {
                        await guild.members.fetch(member.id);
                        invites[inviteKey].totalInvites++;
                        inviteFound = true;
                        console.log(`[INVITE] ${inviterId} - ${member.id} est revenu, invite réactivée (compteur: ${invites[inviteKey].totalInvites})`);
                    } catch {
                    }
                } else {
                    inviteFound = true;
                }
            }
            
            newCache[code] = {
                uses: currentUses,
                inviterId: inviterId
            };
        }
        
        if (!inviteFound) {
            console.log(`[INVITE] Aucune invite détectée pour ${member.id}, recalcul automatique...`);
            await recalculateInvitesFromCurrentState(guild);
            const updatedInvites = await guild.invites.fetch();
            const updatedCache = {};
            for (const [code, invite] of updatedInvites) {
                updatedCache[code] = {
                    uses: invite.uses || 0,
                    inviterId: invite.inviter?.id
                };
            }
            inviteCache.set(guild.id, updatedCache);
        }
        
        inviteCache.set(guild.id, newCache);
        await saveInvites(invites);
    } catch (error) {
        console.error(`Erreur lors du tracking pour ${member.id}:`, error);
    }
}

async function recalculateInvitesFromCurrentState(guild) {
    try {
        const invites = await loadInvites();
        const guildInvites = await guild.invites.fetch();
        
        let memberIds;
        try {
            const guildMembers = await guild.members.fetch();
            memberIds = new Set(guildMembers.map(m => m.id));
        } catch (error) {
            memberIds = new Set(guild.members.cache.map(m => m.id));
            console.log(`[INVITE] Utilisation du cache des membres (rate limit évité)`);
        }
        
        for (const [code, invite] of guildInvites) {
            const inviterId = invite.inviter?.id;
            if (!inviterId) continue;
            
            const inviteKey = `${guild.id}_${inviterId}`;
            if (!invites[inviteKey]) {
                invites[inviteKey] = {
                    userId: inviterId,
                    guildId: guild.id,
                    totalInvites: 0,
                    invites: {}
                };
            }
            
            let activeCount = 0;
            for (const [memberKey, inviteData] of Object.entries(invites[inviteKey].invites || {})) {
                if (memberIds.has(inviteData.memberId)) {
                    inviteData.active = true;
                    activeCount++;
                } else {
                    inviteData.active = false;
                }
            }
            
            if (invites[inviteKey].totalInvites !== activeCount) {
                invites[inviteKey].totalInvites = activeCount;
                console.log(`[INVITE] Auto-recalcul: ${inviterId} a ${activeCount} invites actives (membres uniques présents)`);
            }
        }
        
        await saveInvites(invites);
    } catch (error) {
        console.error(`Erreur lors du recalcul automatique des invites:`, error);
    }
}

async function cleanupInvites(guild) {
    const invites = await loadInvites();
    const guildMembers = await guild.members.fetch();
    const memberIds = new Set(guildMembers.map(m => m.id));
    let updated = false;
    
    for (const [key, userData] of Object.entries(invites)) {
        if (userData.guildId !== guild.id) continue;
        
        let validCount = 0;
        for (const [memberKey, inviteData] of Object.entries(userData.invites || {})) {
            const isActive = memberIds.has(inviteData.memberId);
            if (inviteData.active !== isActive) {
                inviteData.active = isActive;
                updated = true;
            }
            if (isActive) {
                validCount++;
            }
        }
        
        if (updated || userData.totalInvites !== validCount) {
            userData.totalInvites = validCount;
            updated = true;
            console.log(`[INVITE] Nettoyage: ${userData.userId} a maintenant ${validCount} invites actives`);
        }
    }
    
    if (updated) {
        await saveInvites(invites);
    }
}

async function getUserInvites(userId, guildId) {
    const invites = await loadInvites();
    const key = `${guildId}_${userId}`;
    const userData = invites[key];
    
    if (!userData) return 0;
    
    try {
        const guild = await client.guilds.fetch(guildId);
        const guildMembers = await guild.members.fetch();
        const memberIds = new Set(guildMembers.map(m => m.id));
        
        let validCount = 0;
        for (const [memberKey, inviteData] of Object.entries(userData.invites || {})) {
            const isActive = memberIds.has(inviteData.memberId);
            if (inviteData.active !== isActive) {
                inviteData.active = isActive;
            }
            if (isActive) {
                validCount++;
            }
        }
        
        if (validCount !== userData.totalInvites) {
            userData.totalInvites = validCount;
            await saveInvites(invites);
        }
        
        return validCount;
    } catch (error) {
        return userData.totalInvites || 0;
    }
}

async function checkInviteRequirement(userId, guildId, requiredInvites) {
    if (requiredInvites === 0) return true;
    const userInvites = await getUserInvites(userId, guildId);
    return userInvites >= requiredInvites;
}

function generateShortId() {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
}

async function createGiveaway(message, winners, duration, prize, requiredInvites) {
    const endTime = Date.now() + duration;
    const shortId = generateShortId();
    const giveawayId = `${message.guild.id}_${Date.now()}_${shortId}`;
    
    const embed = new EmbedBuilder()
        .setTitle('🎉 GIVEAWAY 🎉')
        .setDescription(`**Lot:** ${prize}\n**Gagnants:** ${winners}\n**Fin:** <t:${Math.floor(endTime / 1000)}:R>\n**Invites requises:** ${requiredInvites || 0}\n\n**🆔 ID:** \`${shortId}\``)
        .setColor(0x1e3a8a)
        .setFooter({ text: `ID: ${shortId} • by 0xRynal` })
        .setTimestamp(endTime);
    
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`giveaway_join_${giveawayId}`)
                .setLabel('Participer')
                .setStyle(ButtonStyle.Success)
        );
    
    const giveawayMessage = await message.channel.send({ embeds: [embed], components: [row] });
    
    const giveaways = await loadGiveaways();
    giveaways[giveawayId] = {
        shortId: shortId,
        messageId: giveawayMessage.id,
        channelId: message.channel.id,
        guildId: message.guild.id,
        winners: winners,
        endTime: endTime,
        prize: prize,
        requiredInvites: requiredInvites || 0,
        participants: [],
        ended: false
    };
    
    await saveGiveaways(giveaways);
    
    setTimeout(async () => {
        await endGiveaway(giveawayId);
    }, duration);
    
    return giveawayMessage;
}

async function endGiveaway(giveawayId) {
    const giveaways = await loadGiveaways();
    const giveaway = giveaways[giveawayId];
    
    if (!giveaway || giveaway.ended) return;
    
    giveaway.ended = true;
    
    let channel;
    try {
        channel = await client.channels.fetch(giveaway.channelId);
    } catch (e) {
        if (e.code === 10003) {
            console.warn(`[giveaway] Channel ${giveaway.channelId} introuvable, giveaway ${giveaway.shortId} marqué terminé.`);
        }
        await saveGiveaways(giveaways);
        return;
    }
    
    const validParticipants = [];
    for (const participantId of giveaway.participants) {
        const hasEnoughInvites = await checkInviteRequirement(
            participantId,
            giveaway.guildId,
            giveaway.requiredInvites
        );
        if (hasEnoughInvites) {
            validParticipants.push(participantId);
        }
    }
    
    if (validParticipants.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaway terminé')
            .setDescription(`Aucun participant valide pour le giveaway: **${giveaway.prize}**`)
            .setFooter({ text: `ID: ${giveaway.shortId} • by 0x0xRynal` })
            .setColor(0x1e3a8a);
        
        try {
            const message = await channel.messages.fetch(giveaway.messageId);
            await message.edit({ embeds: [embed], components: [] });
        } catch (e) {
            await channel.send({ embeds: [embed] });
        }
        
        await saveGiveaways(giveaways);
        return;
    }
    
    const selectedWinners = [];
    const winnersCount = Math.min(giveaway.winners, validParticipants.length);
    
    for (let i = 0; i < winnersCount; i++) {
        const randomIndex = Math.floor(Math.random() * validParticipants.length);
        selectedWinners.push(validParticipants.splice(randomIndex, 1)[0]);
    }
    
    const winnersMention = selectedWinners.map(id => `<@${id}>`).join(', ');
    
    const embed = new EmbedBuilder()
        .setTitle('🎉 Giveaway terminé')
        .setDescription(`**Lot:** ${giveaway.prize}\n**Gagnant(s):** ${winnersMention}`)
        .setFooter({ text: `ID: ${giveaway.shortId} • by 0xRynal` })
        .setColor(0x1e3a8a);
    
    try {
        const message = await channel.messages.fetch(giveaway.messageId);
        await message.edit({ embeds: [embed], components: [] });
    } catch (e) {
        await channel.send({ embeds: [embed] });
    }
    
    await channel.send(`🎉 Félicitations ${winnersMention}! Vous avez gagné: **${giveaway.prize}**`);
    
    giveaway.winnersList = selectedWinners;
    await saveGiveaways(giveaways);
}

async function findGiveawayById(guildId, searchId) {
    const giveaways = await loadGiveaways();
    
    if (giveaways[searchId]) {
        return { id: searchId, giveaway: giveaways[searchId] };
    }
    
    for (const [id, giveaway] of Object.entries(giveaways)) {
        if (giveaway.guildId === guildId && giveaway.shortId === searchId.toUpperCase()) {
            return { id: id, giveaway: giveaway };
        }
    }
    
    return null;
}

async function listActiveGiveaways(guildId) {
    const giveaways = await loadGiveaways();
    const active = [];
    
    for (const [id, giveaway] of Object.entries(giveaways)) {
        if (giveaway.guildId === guildId && !giveaway.ended && giveaway.endTime > Date.now()) {
            active.push({ id: id, giveaway: giveaway });
        }
    }
    
    return active;
}

async function checkAndRemoveInvalidParticipants(guildId, userId) {
    const giveaways = await loadGiveaways();
    let updated = false;
    
    for (const [giveawayId, giveaway] of Object.entries(giveaways)) {
        if (giveaway.guildId !== guildId || giveaway.ended || giveaway.endTime <= Date.now()) {
            continue;
        }
        
        if (giveaway.participants.includes(userId)) {
            const hasEnoughInvites = await checkInviteRequirement(
                userId,
                guildId,
                giveaway.requiredInvites
            );
            
            if (!hasEnoughInvites) {
                giveaway.participants = giveaway.participants.filter(id => id !== userId);
                updated = true;
            }
        }
    }
    
    if (updated) {
        await saveGiveaways(giveaways);
    }
}

async function rerollGiveaway(message, searchId, count) {
    const result = await findGiveawayById(message.guild.id, searchId);
    
    if (!result) {
        const active = await listActiveGiveaways(message.guild.id);
        
        if (active.length === 0) {
            return message.reply('Aucun giveaway actif trouvé.');
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaways actifs')
            .setDescription('Utilisez `/giveaway reroll id:ID` avec un des IDs ci-dessous:')
            .setFooter({ text: 'by 0xRynal' })
            .setColor(0x1e3a8a);
        
        const fields = active.map(({ giveaway }) => {
            const endTime = Math.floor(giveaway.endTime / 1000);
            return {
                name: `🆔 ${giveaway.shortId} - ${giveaway.prize}`,
                value: `Fin: <t:${endTime}:R>\nParticipants: ${giveaway.participants.length}`,
                inline: true
            };
        });
        
        embed.addFields(fields);
        
        return message.reply({ embeds: [embed] });
    }
    
    const { id: giveawayId, giveaway } = result;
    
    const validParticipants = [];
    for (const participantId of giveaway.participants) {
        if (giveaway.winnersList && giveaway.winnersList.includes(participantId)) {
            continue;
        }
        
        const hasEnoughInvites = await checkInviteRequirement(
            participantId,
            giveaway.guildId,
            giveaway.requiredInvites
        );
        if (hasEnoughInvites) {
            validParticipants.push(participantId);
        }
    }
    
    if (validParticipants.length === 0) {
        return message.reply('Aucun participant valide pour le reroll.');
    }
    
    const rerollCount = Math.min(count || 1, validParticipants.length);
    const newWinners = [];
    
    for (let i = 0; i < rerollCount; i++) {
        const randomIndex = Math.floor(Math.random() * validParticipants.length);
        newWinners.push(validParticipants.splice(randomIndex, 1)[0]);
    }
    
    const winnersMention = newWinners.map(id => `<@${id}>`).join(', ');
    
    const embed = new EmbedBuilder()
        .setTitle('🎲 Reroll du Giveaway')
        .setDescription(`**Lot:** ${giveaway.prize}\n**Nouveau(x) gagnant(s):** ${winnersMention}`)
        .setFooter({ text: 'by 0xRynal' })
        .setColor(0x1e3a8a);
    
    message.reply({ embeds: [embed] });
    message.channel.send(`🎉 Félicitations ${winnersMention}! Vous avez gagné: **${giveaway.prize}**`);
    
    const giveaways = await loadGiveaways();
    if (!giveaway.winnersList) {
        giveaway.winnersList = [];
    }
    giveaway.winnersList.push(...newWinners);
    giveaways[giveawayId] = giveaway;
    await saveGiveaways(giveaways);
}

client.once(Events.ClientclientReady, async () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ type: 3, name: 'discord.gg/kuronai', state: 'https://guns.lol/0xRynal' }],
        status: 'online',
    });
    await ensureDataDir();
    
    for (const guild of client.guilds.cache.values()) {
        try {
            await initInviteCache(guild);
            await cleanupInvites(guild);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await recalculateInvitesFromCurrentState(guild);
        } catch (error) {
            console.error(`Erreur lors de l'initialisation pour ${guild.id}:`, error.message);
        }
    }
    
    const giveaways = await loadGiveaways();
    for (const [giveawayId, giveaway] of Object.entries(giveaways)) {
        if (!giveaway.ended && giveaway.endTime > Date.now()) {
            const remainingTime = giveaway.endTime - Date.now();
            setTimeout(() => endGiveaway(giveawayId).catch(e => console.error('[giveaway] endGiveaway:', e.message)), remainingTime);
        } else if (!giveaway.ended) {
            endGiveaway(giveawayId).catch(e => console.error('[giveaway] endGiveaway:', e.message));
        }
    }
});

client.on(Events.GuildMemberAdd, async (member) => {
    trackInvite(member).catch(error => {
        console.error(`Erreur lors du tracking pour ${member.id}:`, error);
    });
});

client.on(Events.GuildMemberRemove, async (member) => {
    const invites = await loadInvites();
    const guild = member.guild;
    let updated = false;
    
    const affectedUsers = [];
    for (const [key, userData] of Object.entries(invites)) {
        if (userData.guildId !== guild.id) continue;
        
        const memberKey = `${member.id}_${userData.userId}`;
        if (userData.invites && userData.invites[memberKey] && userData.invites[memberKey].active) {
            userData.invites[memberKey].active = false;
            userData.totalInvites = Math.max(0, (userData.totalInvites || 0) - 1);
            updated = true;
            affectedUsers.push(userData.userId);
            console.log(`[INVITE] ${member.id} a quitté, invite désactivée pour ${userData.userId} (maintenant ${userData.totalInvites} invites actives)`);
        }
    }
    
    if (updated) {
        await saveInvites(invites);
        
        for (const userId of affectedUsers) {
            await checkAndRemoveInvalidParticipants(guild.id, userId);
        }
    }
    
    if (inviteCache.has(guild.id)) {
        try {
            const currentInvites = await guild.invites.fetch();
            const newCache = {};
            for (const [code, invite] of currentInvites) {
                newCache[code] = {
                    uses: invite.uses || 0,
                    inviterId: invite.inviter?.id
                };
            }
            inviteCache.set(guild.id, newCache);
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du cache après départ:`, error);
        }
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('giveaway_join_')) {
            const giveawayId = interaction.customId.replace('giveaway_join_', '');
            const giveaways = await loadGiveaways();
            const giveaway = giveaways[giveawayId];
            
            if (!giveaway || giveaway.ended) {
                return interaction.reply({ content: 'Ce giveaway est terminé ou introuvable.', flags: 64 });
            }
            
            if (giveaway.participants.includes(interaction.user.id)) {
                return interaction.reply({ content: 'Vous participez déjà à ce giveaway.', flags: 64 });
            }
            
            const hasEnoughInvites = await checkInviteRequirement(
                interaction.user.id,
                interaction.guild.id,
                giveaway.requiredInvites
            );
            
            if (!hasEnoughInvites) {
                const userInvites = await getUserInvites(interaction.user.id, interaction.guild.id);
                return interaction.reply({ 
                    content: `Vous n'avez pas assez d'invites. Requis: ${giveaway.requiredInvites}, Vous avez: ${userInvites}`, 
                    flags: 64 
                });
            }
            
            giveaway.participants.push(interaction.user.id);
            await saveGiveaways(giveaways);
            
            await interaction.reply({ content: '✅ Vous participez maintenant au giveaway!', flags: 64 });
        }
    }
    
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'giveaway') {
            const subcommand = interaction.options.getSubcommand();
            
            if (subcommand === 'start') {
                const winners = interaction.options.getInteger('gagnants');
                const durationStr = interaction.options.getString('duree');
                const prize = interaction.options.getString('lot');
                const requiredInvites = interaction.options.getInteger('invites') || 0;
                
                const duration = ms(durationStr);
                if (!duration || duration < 1000) {
                    return interaction.reply({ content: 'Durée invalide. Exemple: 1h, 30m, 1d', flags: 64 });
                }
                
                await interaction.deferReply();
                const giveawayMessage = await createGiveaway(
                    interaction,
                    winners,
                    duration,
                    prize,
                    requiredInvites
                );
                
                await interaction.editReply({ content: `Giveaway créé: ${giveawayMessage.url}` });
            }
            
            if (subcommand === 'reroll') {
                const giveawayId = interaction.options.getString('id');
                const count = interaction.options.getInteger('nombre') || 1;
                
                await interaction.deferReply();
                await rerollGiveaway(interaction, giveawayId, count);
                await interaction.deleteReply();
            }
            
            if (subcommand === 'list') {
                const active = await listActiveGiveaways(interaction.guild.id);
                
                if (active.length === 0) {
                    return interaction.reply({ content: 'Aucun giveaway actif.', flags: 64 });
                }
                
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Giveaways actifs')
                    .setDescription(`**${active.length}** giveaway(s) en cours`)
                    .setFooter({ text: 'by 0xRynal' })
                    .setColor(0x1e3a8a);
                
                const fields = active.map(({ giveaway }) => {
                    const endTime = Math.floor(giveaway.endTime / 1000);
                    const channel = interaction.guild.channels.cache.get(giveaway.channelId);
                    return {
                        name: `🆔 ${giveaway.shortId} - ${giveaway.prize}`,
                        value: `Salon: ${channel ? channel.toString() : 'Inconnu'}\nFin: <t:${endTime}:R>\nParticipants: ${giveaway.participants.length}\nInvites requises: ${giveaway.requiredInvites}`,
                        inline: false
                    };
                });
                
                embed.addFields(fields);
                
                await interaction.reply({ embeds: [embed] });
            }
        }
        
        if (interaction.commandName === 'invites') {
            const user = interaction.options.getUser('utilisateur') || interaction.user;
            const userInvites = await getUserInvites(user.id, interaction.guild.id);
            
            const embed = new EmbedBuilder()
                .setTitle('📊 Invites')
                .setDescription(`**${user.tag}** a invité **${userInvites}** membre(s)`)
                .setFooter({ text: 'by 0xRynal' })
                .setColor(0x1e3a8a);
            
            await interaction.reply({ embeds: [embed] });
        }
        
    }
});

const AUTHORIZED_USERS = ['685552160594723015'];

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('*')) return;
    
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command === 'leave') {
        const isAuthorized = AUTHORIZED_USERS.includes(message.author.id);
        const isAdmin = message.member.permissions.has('Administrator');
        const isOwner = message.guild.ownerId === message.author.id;
        
        if (!isAuthorized && !isAdmin && !isOwner) {
            return message.reply('Vous devez être administrateur ou propriétaire du serveur pour utiliser cette commande.');
        }
        
        await message.reply('👋 Le bot quitte le serveur...');
        
        setTimeout(async () => {
            try {
                await message.guild.leave();
                console.log(`Bot a quitté le serveur: ${message.guild.name} (${message.guild.id})`);
            } catch (error) {
                console.error(`Erreur lors de la sortie du serveur:`, error);
            }
        }, 1000);
    }
});

client.on(Events.ClientclientReady, async () => {
    const commands = [
        {
            name: 'giveaway',
            description: 'Gérer les giveaways',
            options: [
                {
                    name: 'start',
                    description: 'Créer un nouveau giveaway',
                    type: 1,
                    options: [
                        {
                            name: 'gagnants',
                            description: 'Nombre de gagnants',
                            type: 4,
                            required: true
                        },
                        {
                            name: 'duree',
                            description: 'Durée du giveaway (ex: 1h, 30m, 1d)',
                            type: 3,
                            required: true
                        },
                        {
                            name: 'lot',
                            description: 'Lot à gagner',
                            type: 3,
                            required: true
                        },
                        {
                            name: 'invites',
                            description: 'Nombre d\'invites requises (optionnel)',
                            type: 4,
                            required: false
                        }
                    ]
                },
                {
                    name: 'reroll',
                    description: 'Reroll un giveaway',
                    type: 1,
                    options: [
                        {
                            name: 'id',
                            description: 'ID du giveaway (visible dans le message ou utilisez /giveaway list)',
                            type: 3,
                            required: true
                        },
                        {
                            name: 'nombre',
                            description: 'Nombre de gagnants à reroll (défaut: 1)',
                            type: 4,
                            required: false
                        }
                    ]
                },
                {
                    name: 'list',
                    description: 'Lister tous les giveaways actifs',
                    type: 1
                }
            ]
        },
        {
            name: 'invites',
            description: 'Voir le nombre d\'invites d\'un utilisateur',
            options: [
                {
                    name: 'utilisateur',
                    description: 'Utilisateur à vérifier',
                    type: 6,
                    required: false
                }
            ]
        }
    ];
    
    try {
        await client.application.commands.set(commands);
        console.log('Commandes enregistrées');
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des commandes:', error);
    }
});

const token = process.env.DISCORD_TOKEN || require('./config.json').token;
client.login(token);
