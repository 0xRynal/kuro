const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;

// Install root deps (dotenv pour start-all.js)
if (fs.existsSync(path.join(rootDir, 'package.json'))) {
    console.log('[root] npm install...');
    spawnSync('npm', ['install'], { cwd: rootDir, stdio: 'inherit' });
}

const bots = fs.readdirSync(rootDir)
    .filter(f => f.startsWith('bot-') && fs.statSync(path.join(rootDir, f)).isDirectory())
    .filter(f => fs.existsSync(path.join(rootDir, f, 'package.json')))
    .sort();

console.log(`\n📦 Installation des dépendances pour ${bots.length} bots...\n`);

for (const bot of bots) {
    const botDir = path.join(rootDir, bot);
    console.log(`[${bot}] npm install...`);
    const r = spawnSync('npm', ['install'], { cwd: botDir, stdio: 'inherit' });
    if (r.status !== 0) console.error(`[${bot}] ❌ erreur`);
}

console.log('\n✅ Terminé.\n');
