const fs = require('fs');
const path = require('path');

const defaultPath = path.join(__dirname, '..', '..', '..', 'bot-coin', 'src', 'data', 'wallets.json');
const walletsPath = process.env.COIN_WALLETS_PATH || defaultPath;

function load() {
    const dir = path.dirname(walletsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(walletsPath)) return {};
    try { return JSON.parse(fs.readFileSync(walletsPath, 'utf8')); } catch { return {}; }
}

function save(w) {
    const dir = path.dirname(walletsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(walletsPath, JSON.stringify(w, null, 2), 'utf8');
}

function addToCoinWallet(userId, amount) {
    const w = load();
    const id = String(userId);
    if (!w[id]) w[id] = { balance: 0, lastDaily: 0 };
    w[id].balance = Math.max(0, (w[id].balance || 0) + amount);
    save(w);
    return w[id].balance;
}

module.exports = { addToCoinWallet, load };
