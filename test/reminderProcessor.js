const builder = require('botbuilder');
const expect = require('chai').expect;
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const Reminder = require('../src/models/reminder');
const createReminderProcessor = require('../src/helpers/reminderProcessor');

describe('reminderProcessor', function () {
    const connector = new builder.ConsoleConnector();
    const bot = new builder.UniversalBot(connector);

    it('should throw an error when invoked with invalid argument', function () {
        expect(createReminderProcessor.bind(null, {})).to.throw('Invalid argument: bot must be an instance of UniversalBot.');
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
            
            Reminder.find.restore();
            bot.send.restore();
            done();
        });

        createReminderProcessor(bot)();
    });

    it('should log errors triggered by Reminder.find', function (done) {
        // Create a stub on Reminder.find to pass in the reminders
        sinon.stub(Reminder, 'find', (selector, callback) => {
            callback(new Error('Someting failed'));
        });
        
        sinon.stub(console, 'error', (error) => {
            expect(error.message).to.equal('Someting failed');
            
            Reminder.find.restore();
            console.error.restore();
            done();
        });

        createReminderProcessor(bot)();
    });

    it('should remove expired reminders', function (done) {
        // Create a stub on Reminder.find to pass in the reminders
        sinon.stub(Reminder, 'find', (selector, callback) => {
            callback(null, [{
                _id: '584bff703dcda8033401f451',
                user_address: { user: { id: 'user' }},
                value: 'make more coffee',
                expiration: new Date()
            }]);
        });

        sinon.stub(Reminder, 'remove', (reminder, callback) => {
            expect(reminder._id).to.equal('584bff703dcda8033401f451');
            Reminder.find.restore();
            Reminder.remove.restore();
            bot.send.restore();
            callback(null, 1);
            done();
        });

        sinon.stub(bot, 'send', (message, callback) => {
            callback();
        });

        createReminderProcessor(bot)();
    });

    it('should log errors triggered by Reminder.remove', function (done) {
        // Create a stub on Reminder.find to pass in the reminders
        sinon.stub(Reminder, 'find', (selector, callback) => {
            callback(null, [{
                _id: '584bff703dcda8033401f451',
                user_address: { user: { id: 'user' }},
                value: 'make more coffee',
                expiration: new Date()
            }]);
        });

        sinon.stub(Reminder, 'remove', (reminder, callback) => {     
            callback(new Error('Someting failed'));
        });

        sinon.stub(console, 'error', (error) => {
            expect(error.message).to.equal('Someting failed');
            
            Reminder.find.restore();
            Reminder.remove.restore();
            bot.send.restore();
            console.error.restore();
            done();
        });

        sinon.stub(bot, 'send', (message, callback) => {
            callback();
        });

        createReminderProcessor(bot)();
    });
});