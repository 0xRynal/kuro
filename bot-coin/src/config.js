module.exports = {
    token: process.env.TOKEN_COIN || process.env.TOKEN || '',
    prefix: '!c',
    taxPay: 0.05,
    dailyBase: 500,
    dailyCooldownMs: 24 * 60 * 60 * 1000,
};
