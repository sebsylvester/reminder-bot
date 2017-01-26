const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const { help } = require('../src/dialogs');

describe('dialog /help', function () {
    it('should present a menu containing 3 buttons', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.beginDialogAction('help', '/help', { matches: /^help/i });
        bot.dialog('/help', help);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.HELP);
            expect(Array.isArray(message.attachments)).to.be.true;
            expect(message.attachments.length).to.equal(1);
            expect(Array.isArray(message.attachments[0].content.buttons)).to.be.true;
            expect(message.attachments[0].content.buttons.length).to.equal(3);

            const actualButtons = message.attachments[0].content.buttons;
            const expectedButtons = [
                { title: 'Show reminders', type: 'imBack', value: 'Show reminders' },
                { title: 'Show timezone', type: 'imBack', value: 'Show timezone' },
                { title: 'Reset timezone', type: 'imBack', value: 'Reset timezone' }
            ];
            expect(actualButtons).to.eql(expectedButtons);
            done();
        });

        connector.processMessage('help');
    });

    it('should begin /showTimezone when tapping "Show timezone"', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        consts.Menus.help.forEach(function (item) {
            var name = item.dialogId.slice(1);
            bot.beginDialogAction(name, item.dialogId, { matches: new RegExp('^' + item.title + '$', 'i') });
        });
        bot.dialog('/showTimezone', function (session) {
            expect(session.sessionState.callstack[0].id).to.equal('*:/showTimezone');
            done();
        });

        connector.processMessage('Show timezone');
    });

    it('should begin /showReminders when tapping "Show reminders"', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        consts.Menus.help.forEach(function (item) {
            var name = item.dialogId.slice(1);
            bot.beginDialogAction(name, item.dialogId, { matches: new RegExp('^' + item.title + '$', 'i') });
        });
        bot.dialog('/showReminders', function (session) {
            expect(session.sessionState.callstack[0].id).to.equal('*:/showReminders');
            done();
        });

        connector.processMessage('Show reminders');
    });

    it('should begin /setTimezone when tapping "Reset timezone"', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        consts.Menus.help.forEach(function (item) {
            var name = item.dialogId.slice(1);
            bot.beginDialogAction(name, item.dialogId, { matches: new RegExp('^' + item.title + '$', 'i') });
        });
        bot.dialog('/setTimezone', function (session) {
            expect(session.sessionState.callstack[0].id).to.equal('*:/setTimezone');
            done();
        });

        connector.processMessage('Reset timezone');
    });
});