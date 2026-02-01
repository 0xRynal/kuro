const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const envPath = path.join(rootDir, '.env');
try {
    if (fs.existsSync(envPath)) {
        for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
            const m = line.match(/^([^#=]+)=(.*)$/);
            if (m) process.env[m[1].trim()] = m[2].trim();
        }
    }
} catch (_) {
    try { require('dotenv').config({ path: envPath }); } catch (_) {}
}

const TOKEN_KEYS = {
    'bot-gestion': 'TOKEN_GESTION', 'bot-bl': 'TOKEN_BL', 'bot-secur': 'TOKEN_SECUR',
    'bot-stats': 'TOKEN_STATS', 'bot-voice': 'TOKEN_VOICE', 'bot-autorank': 'TOKEN_AUTORANK',
    'bot-limiterole': 'TOKEN_LIMITEROLE', 'bot-blr': 'TOKEN_BLR', 'bot-coin': 'TOKEN_COIN',
    'bot-minijeu': 'TOKEN_MINIJEU', 'bot-modmail': 'TOKEN_MODMAIL',
    'bot-giveaway': 'DISCORD_TOKEN',
};
const hasToken = (f) => {
    const key = TOKEN_KEYS[f];
    if (key && process.env[key]) return true;
    if (f === 'bot-giveaway') {
        try {
            const cfg = JSON.parse(fs.readFileSync(path.join(rootDir, f, 'config.json'), 'utf8'));
            return !!cfg?.token;
        } catch { }
    }
    return !!process.env.TOKEN;
};
const bots = fs.readdirSync(rootDir)
    .filter(f => f.startsWith('bot-') && fs.statSync(path.join(rootDir, f)).isDirectory())
    .filter(f => fs.existsSync(path.join(rootDir, f, 'index.js')))
    .filter(hasToken)
    .sort();

console.log(`\n🚀 Démarrage de ${bots.length} bots...\n`);

const procs = [];
for (const bot of bots) {
    const botDir = path.join(rootDir, bot);
    const proc = spawn('node', ['index.js'], {
        cwd: botDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
    });
    const prefix = `[${bot}]`;
    proc.stdout?.on('data', (d) => process.stdout.write(d.toString().replace(/^/gm, prefix + ' ')));
    proc.stderr?.on('data', (d) => process.stderr.write(d.toString().replace(/^/gm, prefix + ' ')));
    proc.on('error', (err) => console.error(prefix, err.message));
    proc.on('exit', (code) => code !== 0 && code !== null && console.error(prefix, 'exit', code));
    procs.push(proc);
}

console.log(`\n✅ ${bots.length} bots lancés. Ctrl+C pour arrêter.\n`);

process.on('SIGINT', () => { procs.forEach(p => p.kill()); process.exit(); });
