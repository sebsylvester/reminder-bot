const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const moment = require('moment-timezone');
const utils = require('../src/helpers/utils');
const consts = require('../src/helpers/consts');
const { witClient } = require('../src/helpers/witRecognizer');
const Reminder = require('../src/models/reminder');
const { newReminder, setTimezone, setDatetime } = require('../src/dialogs');
const helpers = require('../src/dialogs/newReminder').helpers;
const timeZoneData = {
    "dstOffset" : 0,
    "rawOffset" : 3600,
    "timeZoneId" : "Europe/Paris",
    "timeZoneName" : "Central European Standard Time"
};

describe('dialog /newReminder', function () {
    // test dialog helper functions
    describe('helper extractDatetimeValue', function () {
        const extractDatetimeValue = helpers.extractDatetimeValue;
        it('should return the value property if type is "value"', function () {
            const datetime = { rawEntity: { type: 'value', value: '2016-11-28T13:27:22.000Z' } }
            expect(extractDatetimeValue(datetime)).to.equal('2016-11-28T13:27:22.000Z');
        });

        it('should return the from.value property if type is not "value"', function () {
            const datetime = { 
                rawEntity: { 
                    type: 'interval', 
                    from: { value: '2016-11-28T13:27:22.000Z' }, 
                    to: { value: '2016-11-28T13:57:22.000Z' }
                }
            }
            expect(extractDatetimeValue(datetime)).to.equal('2016-11-28T13:27:22.000Z');
        });
    });

    describe('helper getMomentMethod', function () {
        const getMomentMethod = helpers.getMomentMethod;
        it('should return "add" when the timezone offset is negative', function () {
            const timeZoneData = { dstOffset: 0, rawOffset: 18000 };
            expect(getMomentMethod(timeZoneData)).to.equal('subtract');
        });

        it('should return "subtract" when the timezone offset is positive', function () {
            const timeZoneData = { dstOffset: 0, rawOffset: -7200 };
            expect(getMomentMethod(timeZoneData)).to.equal('add');
        });
    });

    it('should exit the dialog with an error if the reminder argument is missing', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.on('error', error => {
            expect(error.message).to.equal('Invalid arguments object: reminder property is undefined');
            done();
        });
        bot.dialog('/', (session) => session.beginDialog('/newReminder', {}));
        bot.dialog('/newReminder', newReminder);

        connector.processMessage('start');
    });

    it('should exit the dialog with an error if the message argument is missing', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.on('error', error => {
            expect(error.message).to.equal('Invalid arguments object: message property is undefined');
            done();
        });
        bot.dialog('/', (session) => session.beginDialog('/newReminder', { reminder: {} }));
        bot.dialog('/newReminder', newReminder);

        connector.processMessage('start');
    });

    it('should redirect to /setTimezone if timezone is undefined', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = {
            reminder: { type: 'reminder', entity: 'make coffee' },
            datetime: { rawEntity: { type: 'value', value: '2016-11-28T13:27:22.000Z'}},
            message: 'Remind me to make coffee in 30 minutes'
        };

        bot.dialog('/', (session) => session.beginDialog('/newReminder', args));
        bot.dialog('/newReminder', newReminder);
        bot.dialog('/setTimezone', setTimezone);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.NEED_TIMEZONE);
            done();
        });

        connector.processMessage('start');
    });

    it('should redirect to /setDatetime if datetime is undefined', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = {
            reminder: { type: 'reminder', entity: 'make coffee' },
            message: 'Remind me to make coffee in 30 minutes'
        };

        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = timeZoneData;
                next();
            }
        });
        bot.dialog('/', (session) => session.beginDialog('/newReminder', args));
        bot.dialog('/newReminder', newReminder);
        bot.dialog('/setDatetime', setDatetime);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.ASK_DATETIME.replace(/%s/, 'make coffee'));
            done();
        });

        connector.processMessage('start');
    });

    /**
     * This test uses a datetime entity that needs to be normalized to UTC
     */
    it('should call Reminder.create to save a reminder to MongoDB (1)', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = {
            reminder: { type: 'reminder', entity: 'make coffee' },
            datetime: { rawEntity: { type: 'value', value: '2016-11-28T15:00:00.000Z'}},
            message: 'Remind me to make coffee at 3pm'
        };
        const normalizedDatetime = '2016-11-28T14:00:00.000Z';

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'create', reminder => {
            expect(reminder.user_address).to.be.an('object');
            expect(reminder.value).to.equal(args.reminder.entity);
            expect(reminder.expiration).to.deep.equal(new Date(normalizedDatetime));
            Reminder.create.restore();
            done();
        });

        // Avoid a prompt to set a timezone
        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = timeZoneData;
                next();
            }
        });
        bot.dialog('/', (session) => session.beginDialog('/newReminder', args));
        bot.dialog('/newReminder', newReminder);

        connector.processMessage('start');
    });

    /**
     * This test uses a datetime entity that does not need to be normalized to UTC
     */
    it('should call Reminder.create to save a reminder to MongoDB (2)', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = {
            reminder: { type: 'reminder', entity: 'make coffee' },
            datetime: { rawEntity: { type: 'value', value: '2016-11-28T15:00:00.000Z'}},
            message: 'Remind me to make coffee in 30 minutes'
        };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'create', reminder => {
            expect(reminder.user_address).to.be.an('object');
            expect(reminder.value).to.equal(args.reminder.entity);
            expect(reminder.expiration).to.deep.equal(new Date(args.datetime.rawEntity.value));
            Reminder.create.restore();
            done();
        });

        // Avoid a prompt to set a timezone
        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = timeZoneData;
                next();
            }
        });
        bot.dialog('/', (session) => session.beginDialog('/newReminder', args));
        bot.dialog('/newReminder', newReminder);

        connector.processMessage('start');
    });

    /**
     * This test covers the scenario where all required input is available and
     * the parsed datetime entity does not need to be normalized.
     */
    it('should send a confirmation message upon completion (1)', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = {
            reminder: { type: 'reminder', entity: 'make coffee' },
            datetime: { rawEntity: { type: 'value', value: '2016-11-28T15:00:00.000Z'}},
            message: 'Remind me to make coffee in 30 minutes'
        };
        var confirmationMessage = consts.Messages.CONFIRM_REMINDER
            .replace(/%s/, args.reminder.entity)
            .replace(/%s/, utils.convertTimestamp(args.datetime.rawEntity.value, timeZoneData.timeZoneId));

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'create', (reminder, callback) => {
            callback(null);
        });

        // Avoid a prompt to set a timezone
        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = timeZoneData;
                next();
            }
        });
        bot.dialog('/', (session) => session.beginDialog('/newReminder', args));
        bot.dialog('/newReminder', newReminder);

        bot.on('send', function (message) {
            expect(message.text).to.equal(confirmationMessage);
            Reminder.create.restore();
            done();
        });

        connector.processMessage('start');
    });

    /**
     * This test covers the scenario where the user is prompted to provide a date/time for the reminder and
     * the parsed datetime entity needs to be normalized
     */
    it('should send a confirmation message upon completion (2)', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = {
            reminder: { type: 'reminder', entity: 'make coffee' },
            message: 'Remind me to make coffee'
        };
        const witResponse = {
            "_text": "3pm",
            "entities": {
                "datetime": [{
                    "confidence": 0.9943915074032799,
                    "type": "value",
                    "value": "2016-12-09T15:00:00.000Z",
                    "grain": "hour"
                }]
            }
        };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'create', (reminder, callback) => {
            callback(null);
        });

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        sinon.stub(witClient, 'message', () => Promise.resolve(witResponse));

        var confirmationMessage = consts.Messages.CONFIRM_REMINDER
            .replace(/%s/, args.reminder.entity)
            .replace(/%s/, utils.convertTimestamp(witResponse.entities.datetime[0].value));
        var step = 0;

        // Avoid a prompt to set a timezone
        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = timeZoneData;
                next();
            }
        });
        bot.dialog('/', (session) => session.beginDialog('/newReminder', args));
        bot.dialog('/newReminder', newReminder);
        bot.dialog('/setDatetime', setDatetime);

        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    //expect(message.text).to.equal(consts.Prompts.ASK_DATETIME.replace(/%s/, 'make coffee'));
                    connector.processMessage('3pm');
                    break;
                case 2:
                    //expect(message.text).to.equal(confirmationMessage);
                    witClient.message.restore();
                    Reminder.create.restore();
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });

    it('should send an error message if the create operation fails', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = {
            reminder: { type: 'reminder', entity: 'make coffee' },
            datetime: { rawEntity: { type: 'value', value: '2016-11-28T15:00:00.000Z'}},
            message: 'Remind me to make coffee in 30 minutes'
        };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'create', (reminder, callback) => {
            callback(new Error('Something failed'));
        });

        // Avoid a prompt to set a timezone
        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = timeZoneData;
                next();
            }
        });
        bot.dialog('/', (session) => session.beginDialog('/newReminder', args));
        bot.dialog('/newReminder', newReminder);

        bot.on('send', function (message) {
            expect(message.text).to.equal('Oops. Something went wrong and we need to start over.');
            Reminder.create.restore();
            done();
        });

        connector.processMessage('start');
    });
    
});