const expect = require('chai').expect;
const builder = require('botbuilder');
const consts = require('../src/helpers/consts');

describe('dialog /firstRun', function () {
    it('should redirect to dialog /setTimezone with arguments', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        bot.use(builder.Middleware.firstRun({ version: 1.0, dialogId: '*:/firstRun' }));

        bot.dialog('/', require('../src/dialogs/root'));
        bot.dialog('/firstRun', require('../src/dialogs/firstRun'));
        bot.dialog('/setTimezone', require('../src/dialogs/setTimezone'));

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.FIRST_RUN);
            done();
        });

        connector.processMessage('start');
    });
});