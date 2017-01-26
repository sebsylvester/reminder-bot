const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const utils = require('../src/helpers/utils');
const helpMenu = consts.Menus.help;
const Reminder = require('../src/models/reminder');
const timeZoneData = {
    "dstOffset" : 0,
    "rawOffset" : 3600,
    "timeZoneId" : "Europe/Paris",
    "timeZoneName" : "Central European Standard Time"
};

describe('dialog /showReminders', function () {
    it('should respond with a message if no reminders exist', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'find', (selector, callback) => {
            callback(null, []);
        });

        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = timeZoneData;
                next();
            }
        });
        bot.dialog('/', (session) => session.beginDialog('/showReminders', {}));
        bot.dialog('/showReminders', require('../src/dialogs/showReminders'));

        bot.on('send', function (message) {
            expect(message.text).to.match(/^You do not have any active reminders\. To create one, say something like:.+/);
            Reminder.find.restore();
            done();
        });

        connector.processMessage('start');
    });

    it('should display all reminders in a carousel', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = [
            {
                id: '5849db6aae51c308988b66d1',
                value: 'attend meeting',
                expiration: new Date("2016-12-09T17:00:00Z")
            },
            {
                id: '5849de61b0c00608c266737c',
                value: 'order pizza',
                expiration: new Date("2016-12-09T16:30:00Z")
            }
        ];

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'find', (selector, callback) => {
            callback(null, args);
        });

        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = timeZoneData;
                next();
            }
        });
        bot.dialog('/', (session) => session.beginDialog('/showReminders', args));
        bot.dialog('/showReminders', require('../src/dialogs/showReminders'));

        bot.on('send', function (message) {
            expect(message.attachmentLayout).to.equal('carousel');
            expect(Array.isArray(message.attachments)).to.be.true;
            expect(message.attachments.length).to.equal(2);

            const firstCard = message.attachments[0].content;
            expect(firstCard.title).to.equal(args[0].value);
            expect(firstCard.subtitle).to.equal(utils.convertTimestamp(args[0].expiration, timeZoneData.timeZoneId));
            expect(firstCard.buttons[0]).to.eql({
                title: 'Delete reminder',
                type: 'postBack',
                value: `action?deleteReminder=${args[0].id}`
            });

            const secondCard = message.attachments[1].content;
            expect(secondCard.title).to.equal(args[1].value);
            expect(secondCard.subtitle).to.equal(utils.convertTimestamp(args[1].expiration, timeZoneData.timeZoneId));
            expect(secondCard.buttons[0]).to.eql({
                title: 'Delete reminder',
                type: 'postBack',
                value: `action?deleteReminder=${args[1].id}`
            });

            Reminder.find.restore();
            done();
        });

        connector.processMessage('start');
    });

    it('should trigger an error message if the find operation failed', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = [
            {
                id: '5849db6aae51c308988b66d1',
                value: 'attend meeting',
                expiration: new Date("2016-12-09T17:00:00Z")
            },
            {
                id: '5849de61b0c00608c266737c',
                value: 'order pizza',
                expiration: new Date("2016-12-09T16:30:00Z")
            }
        ];

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'find', (args, callback) => {
            callback(new Error('Something failed'));
        });

        bot.dialog('/', (session) => session.beginDialog('/showReminders', args));
        bot.dialog('/showReminders', require('../src/dialogs/showReminders'));

        bot.on('send', function (message) {
            expect(message.text).to.equal('Oops. Something went wrong and we need to start over.');
            Reminder.find.restore();
            done();
        });

        connector.processMessage('start');
    });
});