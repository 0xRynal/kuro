const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'blacklist.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const LEVELS = {
    1: { label: 'Niveau 1', desc: 'Pedo / Pub MP (grab) / Insultes répétées / Sanctions' },
    2: { label: 'Niveau 2', desc: 'Tentative raid / Token / Raid perm' },
    3: { label: 'Niveau 3', desc: 'Dox / Leak / Autre' },
};

function load() {
    if (!fs.existsSync(file)) return {};
    try {
        const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
        const out = {};
        for (const [gid, data] of Object.entries(raw)) {
            if (Array.isArray(data)) {
                out[gid] = {};
                for (const id of data) out[gid][String(id)] = { levels: { 1: { reason: 'Migration', addedBy: '', addedAt: Date.now() } } };
            } else {
                out[gid] = {};
                for (const [uid, ent] of Object.entries(data)) {
                    if (ent.levels) {
                        out[gid][uid] = ent;
                    } else {
                        out[gid][uid] = { levels: { [ent.level || 1]: { reason: ent.reason || 'Non spécifié', addedBy: ent.addedBy || '', addedAt: ent.addedAt || Date.now() } } };
                    }
                }
            }
        }
        return out;
    } catch { return {}; }
}

function get(guildId) {
    const d = load()[guildId] || {};
    return Object.entries(d).map(([userId, data]) => {
        const levels = Object.entries(data.levels || {}).map(([lvl, info]) => ({ level: parseInt(lvl), ...info }));
        return { userId, levels };
    });
}

function getIds(guildId) {
    return Object.keys(load()[guildId] || {});
}

function add(guildId, userId, level, reason, addedBy) {
    const d = load();
    if (!d[guildId]) d[guildId] = {};
    const id = String(userId);
    if (!d[guildId][id]) d[guildId][id] = { levels: {} };
    if (!d[guildId][id].levels) d[guildId][id].levels = {};
    if (![1, 2, 3].includes(level)) level = 1;
    const hadLevel = !!d[guildId][id].levels[level];
    d[guildId][id].levels[level] = { reason: reason || 'Non spécifié', addedBy: addedBy || '', addedAt: Date.now() };
    fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
    return !hadLevel;
}

function remove(guildId, userId, level) {
    const d = load();
    if (!d[guildId]) return false;
    const id = String(userId);
    const entry = d[guildId][id];
    if (!entry || !entry.levels) return false;
    if (!level || ![1, 2, 3].includes(level)) {
        delete d[guildId][id];
    } else {
        delete entry.levels[level];
        if (Object.keys(entry.levels).length === 0) delete d[guildId][id];
    }
    if (Object.keys(d[guildId]).length === 0) delete d[guildId];
    fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
    return true;
}

function has(guildId, userId) {
    const entry = load()[guildId]?.[String(userId)];
    return entry && Object.keys(entry.levels || {}).length > 0;
}

function hasLevel(guildId, userId, level) {
    return !!load()[guildId]?.[String(userId)]?.levels?.[level];
}

function getEntry(guildId, userId) {
    const data = load()[guildId]?.[String(userId)];
    if (!data || !data.levels || Object.keys(data.levels).length === 0) return null;
    const levels = Object.entries(data.levels).map(([lvl, info]) => ({ level: parseInt(lvl), ...info }));
    return { levels };
}

module.exports = { get, getIds, add, remove, has, hasLevel, getEntry, LEVELS };
