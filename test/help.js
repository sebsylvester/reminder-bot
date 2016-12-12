const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const consts = require('../src/helpers/consts');

describe('dialog /help', function () {
    it('should present a menu containing 3 buttons', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.beginDialogAction('help', '/help', { matches: /^help/i });
        bot.dialog('/help', require('../src/dialogs/help'));

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

    it('should begin /showReminders when tapping the "See my reminders"', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.beginDialogAction('help', '/help', { matches: /^help/i });
        bot.dialog('/help', require('../src/dialogs/help'));
        bot.dialog('/showReminders', function (session) {
            expect(session.sessionState.callstack[0].id).to.equal('*:/help');
            expect(session.sessionState.callstack[1].id).to.equal('*:/showReminders');
            done();
        });

        bot.on('send', function () {
            connector.processMessage('See my reminders');
        });

        connector.processMessage('help');
    });

    it('should begin /setTimezone when tapping the "Reset my timezone"', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.beginDialogAction('help', '/help', { matches: /^help/i });
        bot.dialog('/help', require('../src/dialogs/help'));
        bot.dialog('/setTimezone', function (session) {
            expect(session.sessionState.callstack[0].id).to.equal('*:/help');
            expect(session.sessionState.callstack[1].id).to.equal('*:/setTimezone');
            done();
        });

        bot.on('send', function () {
            connector.processMessage('Reset my timezone');
        });

        connector.processMessage('help');
    });

    it('should reprompt when typing an invalid value', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        const witClient = require('../src/api_clients/witClient');
        sinon.stub(witClient, 'message', () => {
            const response = {
                "_text": "foo",
                "entities": {
                    "greeting": [
                        {
                            "confidence": 0.7237044579338374,
                            "start": 0,
                            "end": 3,
                            "body": "foo",
                            "value": {
                                "value": "foo"
                            },
                            "entity": "greeting"
                        }
                    ]
                }
            };
            return Promise.resolve(response);
        });

        bot.beginDialogAction('help', '/help', { matches: /^help/i });
        bot.dialog('/help', require('../src/dialogs/help'));

        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    connector.processMessage('foo');
                    break;
                case 2:
                    expect(message.text).to.equal(consts.Prompts.LIST_RETRY);
                    witClient.message.restore();
                    done();
                    break;
            }
        });

        connector.processMessage('help');
    });

    it('should cancel when typing "cancel"', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        bot.beginDialogAction('help', '/help', { matches: /^help/i });
        bot.dialog('/help', require('../src/dialogs/help'))
            .cancelAction('cancelSetTimezone', consts.Messages.CANCEL_HELP, { matches: /^(cancel|nevermind)/i });;

        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    connector.processMessage('cancel');
                    break;
                case 2:
                    expect(message.text).to.equal(consts.Messages.CANCEL_HELP);
                    done();
                    break;
            }
        });

        connector.processMessage('help');
    });

    it('should cancel when typing "nevermind"', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        bot.beginDialogAction('help', '/help', { matches: /^help/i });
        bot.dialog('/help', require('../src/dialogs/help'))
            .cancelAction('cancelSetTimezone', consts.Messages.CANCEL_HELP, { matches: /^(cancel|nevermind)/i });;

        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    connector.processMessage('nevermind');
                    break;
                case 2:
                    expect(message.text).to.equal(consts.Messages.CANCEL_HELP);
                    done();
                    break;
            }
        });

        connector.processMessage('help');
    });
});