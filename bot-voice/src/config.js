module.exports = {
    token: process.env.TOKEN_VOICE || process.env.TOKEN || '',
    prefix: '!v',
    inviteCode: process.env.VOICE_STATS_INVITE || 'kuronai',
    statsCategoryId: process.env.VOICE_STATS_CATEGORY_ID || '1467584446172627029',
};
