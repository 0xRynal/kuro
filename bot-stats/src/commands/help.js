const config = require('../config');

module.exports = { data: { name: 'help' }, async execute(message) {
    await message.reply(`📊 **Stats** — \`${config.prefix}stats\` : membres + en vocal.`);
}};
