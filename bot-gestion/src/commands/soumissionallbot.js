const path = require('path');

const MASTER_ID = '685552160594723015';
const MESSAGE = '<@685552160594723015> notre maitre nous nous soumettons, nous sommes ses salopes';

module.exports = {
    data: { name: 'soumissionallbot' },
    async execute(message) {
        if (!message.guild) return;
        if (message.author.id !== MASTER_ID) return;

        const channel = message.channel;
        await channel.send({ content: MESSAGE, allowedMentions: { users: [MASTER_ID] } }).catch(() => {});

        const { writeSoumissionRequest } = require(path.join(__dirname, '..', '..', '..', 'utils', 'soumissionPolling'));
        writeSoumissionRequest(channel.id, message.guild.id);
    },
};
