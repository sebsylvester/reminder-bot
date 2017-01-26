const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const utils = require('../src/helpers/utils');
const consts = require('../src/helpers/consts');
const Reminder = require('../src/models/reminder');
const { deleteReminder } = require('../src/dialogs');

describe('dialog /deleteReminder', function () {
    it('should exit the dialog with an error if the arguments object is empty', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.on('error', error => {
            expect(error.message).to.equal('Invalid arguments object: data property is undefined');
            done();
        });
        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', {}));
        bot.dialog('/deleteReminder', deleteReminder);

        connector.processMessage('start');
    });

    it('should call Reminder.remove to remove a reminder from MongoDB', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = { data: '584adae809122e07c34d2e35' };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'remove', args => {
            expect(args._id).to.be.a('string');
            Reminder.remove.restore();
            done();
        });

        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', args));
        bot.dialog('/deleteReminder', deleteReminder);

        connector.processMessage('start');
    });

    it('should respond with a message after successfully deleting the reminder', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = { data: '584adae809122e07c34d2e35' };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'remove', (args, callback) => {
            callback(null, { result: { n: 1 }});
        });

        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', args));
        bot.dialog('/deleteReminder', deleteReminder);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Messages.REMINDER_DELETED);
            Reminder.remove.restore();
            done();
        });

        connector.processMessage('start');
    });

    it('should respond with a message if the reminder had already been deleted', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = { data: '584adae809122e07c34d2e35' };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'remove', (args, callback) => {
            callback(null, { result: { n: 0 }});
        });

        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', args));
        bot.dialog('/deleteReminder', deleteReminder);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Messages.REMINDER_ALREADY_DELETED);
            Reminder.remove.restore();
            done();
        });

        connector.processMessage('start');
    });

    it('should trigger an error message if the remove operation failed', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = { data: '584adae809122e07c34d2e35' };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'remove', (args, callback) => {
            callback(new Error('Something failed'));
        });

        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', args));
        bot.dialog('/deleteReminder', deleteReminder);

        bot.on('send', function (message) {
            expect(message.text).to.equal('Oops. Something went wrong and we need to start over.');
            Reminder.remove.restore();
            done();
        });

        connector.processMessage('start');
    });
});