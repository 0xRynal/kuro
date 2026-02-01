const fs = require('fs');
const path = require('path');
const { ChannelType } = require('discord.js');

const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'voice_stats.json');
const DEFAULT_CATEGORY = '1467584446172627029';

function load() {
    if (!fs.existsSync(file)) return { guilds: {} };
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return { guilds: {} }; }
}

function save(data) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function getConfig(guildId) {
    const d = load();
    return d.guilds?.[guildId] || null;
}

function setConfig(guildId, cfg) {
    const d = load();
    if (!d.guilds) d.guilds = {};
    d.guilds[guildId] = cfg;
    save(d);
}

function clearConfig(guildId) {
    const d = load();
    if (d.guilds && d.guilds[guildId]) {
        delete d.guilds[guildId];
        save(d);
    }
}

async function deleteChannels(guild, cfg) {
    if (!cfg?.channels) return;
    for (const id of Object.values(cfg.channels)) {
        const ch = guild.channels.cache.get(id);
        if (ch) await ch.delete().catch(() => {});
    }
}

async function createChannels(guild, categoryId, inviteCode) {
    const cat = categoryId || DEFAULT_CATEGORY;
    const category = guild.channels.cache.get(cat);
    if (!category || category.type !== ChannelType.GuildCategory) return null;

    const chNames = ['🪻・Membres : 0', '🪻・En ligne : 0', '🪻・Vocal : 0', `🪻・.gg/${inviteCode || 'kuronai'}`];
    const keys = ['membres', 'online', 'vocal', 'invite'];
    const channels = {};

    for (let i = 0; i < chNames.length; i++) {
        const ch = await guild.channels.create({
            name: chNames[i],
            type: ChannelType.GuildVoice,
            parent: category.id,
            userLimit: 0,
        }).catch(() => null);
        if (ch) channels[keys[i]] = ch.id;
    }

    if (Object.keys(channels).length === 4) {
        setConfig(guild.id, { categoryId: category.id, channels });
        return channels;
    }
    return null;
}

async function updateChannels(guild, cfg, inviteCode) {
    if (!cfg?.channels) return;
    await guild.members.fetch({ withPresences: true }).catch(() => {});
    const total = guild.memberCount;
    const online = guild.members.cache.filter(m => m.presence?.status && m.presence.status !== 'offline').size;
    const inVoice = guild.members.cache.filter(m => m.voice?.channel).size;
    const inv = inviteCode || 'kuronai';

    const updates = [
        [cfg.channels.membres, `🪻・Membres : ${total}`],
        [cfg.channels.online, `🪻・En ligne : ${online}`],
        [cfg.channels.vocal, `🪻・Vocal : ${inVoice}`],
        [cfg.channels.invite, `🪻・.gg/${inv}`],
    ];

    for (const [id, name] of updates) {
        if (!id) continue;
        const ch = guild.channels.cache.get(id);
        if (ch && ch.name !== name) await ch.setName(name).catch(() => {});
    }
}

module.exports = { getConfig, setConfig, clearConfig, deleteChannels, createChannels, updateChannels, load, DEFAULT_CATEGORY };
