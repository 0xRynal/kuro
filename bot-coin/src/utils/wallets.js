const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', 'data');
const walletsPath = path.join(dataDir, 'wallets.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function load() {
    if (!fs.existsSync(walletsPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(walletsPath, 'utf8'));
    } catch { return {}; }
}

function save(w) {
    fs.writeFileSync(walletsPath, JSON.stringify(w, null, 2), 'utf8');
}

function get(userId) {
    const w = load();
    if (!w[userId]) w[userId] = { balance: 0, lastDaily: 0 };
    return w[userId];
}

function set(userId, data) {
    const w = load();
    w[userId] = { ...get(userId), ...data };
    save(w);
    return w[userId];
}

function add(userId, amount) {
    const u = get(userId);
    u.balance = Math.max(0, (u.balance || 0) + amount);
    set(userId, u);
    return u.balance;
}

function addBalance(userId, amount) {
    return add(userId, amount);
}

module.exports = { load, save, get, set, add, addBalance };
