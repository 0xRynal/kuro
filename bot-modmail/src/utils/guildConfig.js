const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const file = path.join(dataDir, 'modmail_config.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function load() {
    if (!fs.existsSync(file)) return {};
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function save(d) {
    fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
}

function get(key) {
    const d = load();
    return d[key];
}

function set(key, value) {
    const d = load();
    d[key] = value;
    save(d);
}

module.exports = { load, get, set, save };
