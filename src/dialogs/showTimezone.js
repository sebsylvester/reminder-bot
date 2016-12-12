const builder = require('botbuilder');
const consts = require('../helpers/consts');

module.exports = [
    (session) => {
        const { timeZoneData: tz } = session.userData;
        if (tz) {
            session.endDialog(consts.Messages.CURRENT_TIMEZONE, tz.timeZoneName);
        }
        else {
            builder.Prompts.confirm(session, consts.Prompts.SET_TIMEZONE);
        }
    },
    (session, results) => {
        if (results.response) {
            session.beginDialog('/setTimezone');
        } else {
            session.endDialog(consts.Messages.CANCEL_TIMEZONE);
        }
    }
];