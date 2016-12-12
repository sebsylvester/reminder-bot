const consts = require('../helpers/consts');
const Reminder = require('../models/reminder');

module.exports = (session, args) => {
    const { data: reminderId } = args;

    if (!reminderId) {
        return session.error(new Error("Invalid arguments object: data property is undefined"));
    }

    Reminder.remove({ _id: reminderId }, (err ,res) => {
        if (err !== null) {
            return session.error(err);
        }

        const message = (res.result.n === 0)
            ? consts.Messages.REMINDER_ALREADY_DELETED
            : consts.Messages.REMINDER_DELETED;

        session.endDialog(message);
    });

};