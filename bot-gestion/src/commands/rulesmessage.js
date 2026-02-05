const { getRandomNoPermission, getRandomError } = require('../utils/messages');
const { hasFullPermissions } = require('../utils/whitelist');

const allowedUserId = '1442529326955368468';

module.exports = {
    data: {
        name: 'rulesmessage',
    },
    async execute(message, args) {
        if (!message.guild) return;
        // check user id or full permissions
        if (message.author.id !== allowedUserId && !hasFullPermissions(message.author.id, message.guild?.id)) {
            return message.reply(getRandomNoPermission('rulesmessage', false));
        }

        const rulesChannelId = '1457139280773120155';

        try {
            // send rules embed
            const rulesChannel = message.guild.channels.cache.get(rulesChannelId);
            if (rulesChannel) {
                await rulesChannel.send({
                    embeds: [{
                        color: 0x0099FF,
                        title: '📜 Règlement du Serveur',
                        description: `**1️⃣ Respect et bienveillance**
• Traitez tous les membres avec respect, quelle que soit leur opinion, origine ou niveau d'expérience.
• Les insultes, harcèlement, menaces ou discriminations ne seront pas tolérés.
• Évitez le spam, le flood ou toute forme de provocation inutile.

⸻

**2️⃣ Contenu**
• Pas de contenu NSFW, violent ou illégal.
• Les liens malveillants, publicités non autorisées et arnaques sont interdits.
• Les spoilers doivent être signalés avant publication.

⸻

**3️⃣ Canaux et discussions**
• Utilisez le canal approprié pour chaque sujet.
• Évitez de déranger les discussions sérieuses avec des messages hors sujet.
• Les débats sont autorisés, mais restez courtois et respectez les avis des autres.

⸻

**4️⃣ Noms et avatars**
• Les pseudonymes et avatars doivent être appropriés et non offensants.
• Les noms ou images à caractère NSFW ou choquant sont interdits.

⸻

**5️⃣ Sécurité et vie privée**
• Ne partagez jamais vos informations personnelles (adresse, téléphone, identifiants…).
• Ne harcelez pas les membres en dehors du serveur.
• Respectez la vie privée des autres, le respect est la clé.

⸻

**6️⃣ Rôles et permissions**
• Les rôles sont attribués par les modérateurs selon le comportement et la participation.
• Les abus de permissions ou tentatives de contournement ne seront pas tolérés.

⸻

**7️⃣ Modération**
• Les décisions des modérateurs sont finales.
• Toute infraction peut entraîner :
• Avertissement
• Mute temporaire
• Bannissement temporaire ou définitif
• Si vous avez un problème, contactez un modérateur en privé plutôt que d'escalader le conflit.

⸻

**8️⃣ Suggestions et feedback**
• Les idées pour améliorer le serveur sont toujours les bienvenues !
• Merci de les poster dans le canal #suggestions et non ailleurs.

⸻

**⚠️ Rappel final**

En rejoignant ce serveur, vous acceptez de respecter ce règlement.
Le but est que chacun puisse profiter d'un espace agréable, sûr et fun.`,
                        timestamp: new Date().toISOString(),
                    }],
                });
            }

            await message.reply('✅ Le message de règles a été envoyé avec succès !');
        } catch (error) {
            console.error('Erreur lors de l\'envoi des messages:', error);
            const { safeReply } = require('../utils/messages');
            await safeReply(message, getRandomError());
        }
    },
};
