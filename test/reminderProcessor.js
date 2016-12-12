const builder = require('botbuilder');
const expect = require('chai').expect;
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const Reminder = require('../src/models/reminder');
const createReminderProcessor = require('../src/helpers/reminderProcessor');

describe('reminderProcessor', function () {
    const connector = new builder.ConsoleConnector();
    const bot = new builder.UniversalBot(connector);

    after(function () {
        Reminder.find.restore();
        bot.send.restore();
    });

    it('should throw an error when invoked with invalid argument', function () {
        function invokeWithInvalidArgument() {
            createReminderProcessor({});
        }
        expect(invokeWithInvalidArgument).to.throw('Invalid argument: bot must be an instance of UniversalBot.');
    });

    it('should trigger the bot to send a notification for expired reminders', function (done) {
        // Create a stub on Reminder.find to pass in the reminders
        sinon.stub(Reminder, 'find', (selector, callback) => {
            callback(null, [{
                _id: '584bff703dcda8033401f451',
                user_address: { user: { id: 'user' }},
                value: 'make more coffee',
                expiration: new Date()
            }]);
        });

        // Create a stub on the bot's send method to inspect the message it's going to send
        sinon.stub(bot, 'send', (message) => {
            expect(message.constructor.name).to.equal('Message');
            expect(message.data.text).to.equal(consts.Messages.REMINDER.replace(/%s/, 'make more coffee'));
            expect(message.data.address).to.deep.equal({ user: { id: 'user' }});
            done();
        });

        createReminderProcessor(bot)();
    });
});