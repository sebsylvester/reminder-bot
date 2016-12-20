const builder = require('botbuilder');
const utils = require('../helpers/utils');
const consts = require('../helpers/consts');
const Reminder = require('../models/reminder');

module.exports = (session) => {
    Reminder.find({ 'user_address.user.id': session.message.address.user.id }, (err, res) => {
        var message;

        if (err !== null) {
            return session.error(err);
        }

        if (res.length === 0) {
            message = consts.Messages.NO_REMINDERS.replace(/%s/, utils.getRandomReminder());
        } else {
            const { timeZoneId } = session.userData.timeZoneData;
            const cards = res.map((reminder) => {
                return new builder.ThumbnailCard(session)
                    .title(reminder.value)
                    .subtitle(utils.convertTimestamp(reminder.expiration, timeZoneId))
                    .buttons([ builder.CardAction.dialogAction(session, 'deleteReminder', reminder.id, 'Delete reminder') ]);
            });

            message = new builder.Message(session)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(cards);
        }

        session.endDialog(message);
    });
};