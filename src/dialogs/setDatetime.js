const builder = require('botbuilder');
const consts = require('../helpers/consts');
const utils = require('../helpers/utils');
const { witClient } = require('../helpers/witRecognizer');

module.exports = [
    // Prompt user to enter the date/time to schedule the alert
    (session, args) => {
        const { reminder, retry } = args;
        const { ASK_DATETIME: message, ASK_DATETIME_RETRY: retryMessage } = consts.Prompts;

        // dialog should not run without reminder argument
        if (!reminder) {
            return session.error(new Error('Invalid arguments object: reminder property is undefined'));
        }

        // Cache the reminder argument
        session.dialogData.reminder = reminder;
        // Prompt the user with the right message, depending on whether this is a retry or not
        builder.Prompts.text(session, (retry ? retryMessage : message).replace(/%s/, reminder));
    },
    //Wit.ai request with results.response to obtain a datetime string
    (session, results) => {
        witClient.message(results.response)
            .then(response => {
                const { datetime } = response.entities;
                const { _text: text } = response;

                // If no datetime entity was parsed by Wit.ai, ask the user to try again
                if (!datetime) {
                    return session.replaceDialog('/setDatetime', { reminder: session.dialogData.reminder, retry: true });
                }

                session.endDialogWithResult({ datetime: utils.processDatetimeEntity(datetime), text });
            })
            .catch(err => {
                session.error(err);
            });
    }
];