const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'tickets.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function load() {
    if (!fs.existsSync(file)) return {};
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function save(d) {
    fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
}

function getByChannel(channelId) {
    const d = load();
    return Object.entries(d).find(([, t]) => t.channelId === channelId)?.[1] || null;
}

function getByUser(userId) {
    const d = load();
    return Object.entries(d).find(([, t]) => t.userId === userId && !t.closed)?.[1] || null;
}

function create(userId, channelId, guildId) {
    const d = load();
    const id = `ticket_${Date.now()}`;
    d[id] = { userId, channelId, guildId, closed: false, createdAt: Date.now() };
    save(d);
    return d[id];
}

function close(channelId) {
    const d = load();
    const entry = Object.entries(d).find(([, t]) => t.channelId === channelId);
    if (entry) {
        entry[1].closed = true;
        entry[1].closedAt = Date.now();
        save(d);
        return true;
    }
    return false;
}

function getOpenTickets(guildId) {
    const d = load();
    return Object.entries(d).filter(([, t]) => t.guildId === guildId && !t.closed);
}

module.exports = { load, getByChannel, getByUser, create, close, getOpenTickets };
