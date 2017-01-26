const chance = require('chance');
const moment = require('moment-timezone');
const consts = require('./consts');

/**
 * Returns a random example of a reminder message
 * @returns {String}
 */
exports.getRandomReminder = () => {
    return getRandom('reminder');
};

/**
 * Returns a random example of a greeting message
 * @returns {String}
 */
exports.getRandomGreeting = () => {
    return getRandom('greeting');
};

/**
 * Returns a random example of a specified entity
 * @param entity {String}
 * @returns {String}
 */
const getRandom = (entity) => {
    var messages;

    switch (entity) {
        case 'reminder':
            messages = consts.Messages.EXAMPLE_REMINDERS;
            break;
        case 'greeting':
            messages = consts.Messages.GREETINGS;
            break;
        default:
            console.log('Unknown entity %s', entity);
    }
    return messages ? chance().pickone(messages) : '';
};
exports.getRandom = getRandom;

/**
 * Converts a timestamp into a more readable string
 * Example: convertTimestamp('2016-11-27T15:30:00.000Z', 'Europe/Paris') will return "04:30 PM on Sunday, November 27"
 * @param datetime {String}
 * @param timezone {String}
 * @returns {String}
 */
exports.convertTimestamp = (datetime, timezone) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const m = moment.tz(datetime, timezone);

    var hours = m.hours();
    hours = hours > 12 ? (hours - 12) : hours;

    var minutes = m.minutes();
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    const meridiem = m.hours() < 12 ? 'AM' : 'PM';
    const weekday = weekdays[m.isoWeekday() - 1];
    const month = months[m.month()];
    const date = m.date();

    return `${hours}:${minutes} ${meridiem} on ${weekday}, ${month} ${date}`;
};

/**
 * Processes the datetime entity object returned by Wit.ai
 * @param datetime {Object}
 * @returns {String}
 */
exports.processDatetimeEntity = (datetime) => {
    if (!Array.isArray(datetime) || datetime.length === 0) {
        throw new Error('Invalid argument: datetime must be an array');
    }
    // There is always a type property that equals eiter 'value' or 'interval'
    const { type } =  datetime[0];
    // If type is inteval the datetime object has 'from' and 'to' properties
    return type === 'value' ? datetime[0].value : datetime[0].from.value;
};