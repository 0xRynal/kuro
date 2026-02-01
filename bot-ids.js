require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path = require('path');
const fs = require('fs');

const tokenVars = [
    'TOKEN_GESTION', 'TOKEN_BL', 'TOKEN_SECUR', 'TOKEN_STATS', 'TOKEN_VOICE',
    'TOKEN_AUTORANK', 'TOKEN_LIMITEROLE', 'TOKEN_BLR', 'TOKEN_COIN',
    'TOKEN_MINIJEU', 'TOKEN_MODMAIL', 'TOKEN_GIVEAWAY', 'DISCORD_TOKEN', 'TOKEN'
];

const botNames = {
    TOKEN_GESTION: 'bot-gestion',
    TOKEN_BL: 'bot-bl',
    TOKEN_SECUR: 'bot-secur',
    TOKEN_STATS: 'bot-stats',
    TOKEN_VOICE: 'bot-voice',
    TOKEN_AUTORANK: 'bot-autorank',
    TOKEN_LIMITEROLE: 'bot-limiterole',
    TOKEN_BLR: 'bot-blr',
    TOKEN_COIN: 'bot-coin',
    TOKEN_MINIJEU: 'bot-minijeu',
    TOKEN_MODMAIL: 'bot-modmail',
    TOKEN_GIVEAWAY: 'bot-giveaway',
    DISCORD_TOKEN: 'bot-giveaway',
    TOKEN: 'fallback',
};

function getIdFromToken(token) {
    try {
        const base64 = token.split('.')[0];
        return Buffer.from(base64, 'base64').toString('utf8');
    } catch {
        return null;
    }
}

function getInviteUrl(botId, permissions = 8) {
    return `https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=${permissions}&scope=bot`;
}

const results = [];
const seen = new Set();

for (const varName of tokenVars) {
    let token = process.env[varName];
    if ((!token || token.trim() === '') && varName === 'TOKEN_GIVEAWAY') {
        try {
            const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'bot-giveaway', 'config.json'), 'utf8'));
            token = cfg?.token;
        } catch { }
    }
    if (!token || token.trim() === '') continue;
    const id = getIdFromToken(token);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const name = botNames[varName] || varName;
    results.push({ var: varName, name, id, url: getInviteUrl(id) });
}

console.log('\n📋 IDs et URLs d\'invite des bots\n');
console.log('─'.repeat(80));
for (const r of results) {
    console.log(`${r.name.padEnd(18)} | ${r.var.padEnd(18)} | ID: ${r.id}`);
    console.log(`                    → ${r.url}`);
    console.log('─'.repeat(80));
}
