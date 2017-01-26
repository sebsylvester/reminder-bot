const { IntentDialog, DialogAction, EntityRecognizer } = require('botbuilder');
const consts = require('../helpers/consts');
const config = require('../../config');
const utils = require('../helpers/utils');
const { witRecognizer } = require('../helpers/witRecognizer');

module.exports = new IntentDialog({ recognizers: [witRecognizer] })
    .matches('set_timezone', DialogAction.beginDialog('/setTimezone'))
    .matches('show_reminders', DialogAction.beginDialog('/showReminders'))
    .matches('show_timezone', DialogAction.beginDialog('/showTimezone'))
    .onDefault((session, args) => {
        const message = session.message.text;
        const { entities } = args;

        // Extract all the useful entities.
        const reminder = EntityRecognizer.findEntity(entities, 'reminder');
        const datetime = EntityRecognizer.findEntity(entities, 'datetime');
        const greeting = EntityRecognizer.findEntity(entities, 'greeting');

        // The user wants to set a new reminder.
        // If datetime is undefined, the bot will prompt the user to choose one.
        if (reminder && message.match(/remind me/i))
            session.beginDialog('/newReminder', { reminder, datetime, message });
        // If the user just sends a greeting, send a greeting back and show an example of how to set a reminder.
        else if (greeting && !reminder && !datetime)
            session.endDialog(consts.Messages.GREETING_RESPONSE, utils.getRandomGreeting(), utils.getRandomReminder());
        // Send a default response
        else session.endDialog(consts.Messages.DEFAULT_RESPONSE, utils.getRandomReminder());
    });