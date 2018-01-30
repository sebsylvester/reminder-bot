const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const Reminder = require('../src/models/reminder');
const { deleteReminder } = require('../src/dialogs');

describe('dialog /deleteReminder', () => {
    it('should exit the dialog with an error if the arguments object is empty', (done) => {
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

    it('should call Reminder.remove to remove a reminder from MongoDB', (done) => {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = { data: '584adae809122e07c34d2e35' };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'remove').callsFake(args => {
            expect(args._id).to.be.a('string');
            Reminder.remove.restore();
            done();
        });

        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', args));
        bot.dialog('/deleteReminder', deleteReminder);

        connector.processMessage('start');
    });

    it('should respond with a message after successfully deleting the reminder', (done) => {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = { data: '584adae809122e07c34d2e35' };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'remove').callsFake((args, callback) => {
            callback(null, { result: { n: 1 }});
        });

        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', args));
        bot.dialog('/deleteReminder', deleteReminder);

        bot.on('send', (message) => {
            expect(message.text).to.equal(consts.Messages.REMINDER_DELETED);
            Reminder.remove.restore();
            done();
        });

        connector.processMessage('start');
    });

    it('should respond with a message if the reminder had already been deleted', (done) => {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = { data: '584adae809122e07c34d2e35' };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'remove').callsFake((args, callback) => {
            callback(null, { result: { n: 0 }});
        });

        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', args));
        bot.dialog('/deleteReminder', deleteReminder);

        bot.on('send', (message) => {
            expect(message.text).to.equal(consts.Messages.REMINDER_ALREADY_DELETED);
            Reminder.remove.restore();
            done();
        });

        connector.processMessage('start');
    });

    it('should trigger an error message if the remove operation failed', (done) => {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const args = { data: '584adae809122e07c34d2e35' };

        // Create a stub on the Reminder model
        sinon.stub(Reminder, 'remove').callsFake((args, callback) => {
            callback(new Error('Something failed'));
        });
        sinon.stub(console, "error").callsFake(() => null);

        bot.dialog('/', (session) => session.beginDialog('/deleteReminder', args));
        bot.dialog('/deleteReminder', deleteReminder);

        bot.on('send', (message) => {
            if (message.type === 'message') {
                expect(message.text).to.equal('Oops. Something went wrong and we need to start over.');
            }
            if (message.type === 'endOfConversation') {
                Reminder.remove.restore();
                (console.error).restore();
                done();
            }
        });

        connector.processMessage('start');
    });
});