const consts = require('../helpers/consts');
const utils = require('../helpers/utils');
const witClient = require('../api_clients/witClient');

const intents = [
    { name: 'set_timezone', dialogId: '/setTimezone' },
    { name: 'show_reminders', dialogId: '/showReminders' },
    { name: 'show_timezone', dialogId: '/showTimezone' }
];

module.exports = (session) => {
    const message = session.message.text;
    witClient.message(message)
        .then(response => {
            // Destructure all known entities from the response
            // Absent entities will default to undefined
            const { intent, reminder, datetime, greeting } = response.entities;
            const intentValue = Array.isArray(intent) && intent[0].value;
            const intentIndex = intentValue ? intents.findIndex(i => i.name === intentValue) : -1;

            // Deal with intent first. The reason for this is that Wit.ai can include a 'false' reminder entity
            // in the response object when parsing messages like 'Reset my timezone' or 'Show my reminders'.
            // In those cases the reminder entity should be ignored.
            if (intentIndex > -1) {
                session.beginDialog(intents[intentIndex].dialogId);
            } else if (reminder && message.match(/remind me/i)) {
                session.beginDialog('/newReminder', { reminder, datetime, message });
            } else if (greeting && Object.keys(response.entities).length === 1) {
                // If user sends a greeting, send a greeting back and show an example of how to set a reminder.
                session.endDialog(consts.Messages.GREETING_RESPONSE, utils.getRandomGreeting(), utils.getRandomReminder());
            } else {
                // Oops, I didn't get that...
                session.endDialog(consts.Messages.DEFAULT_RESPONSE, utils.getRandomReminder());
            }
        })
        .catch(err => {
            session.error(err);
        });
};