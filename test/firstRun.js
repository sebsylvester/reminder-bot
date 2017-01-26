const expect = require('chai').expect;
const builder = require('botbuilder');
const consts = require('../src/helpers/consts');
const { firstRun, setTimezone, root } = require('../src/dialogs');

describe('dialog /firstRun', function () {
    it('should redirect to dialog /setTimezone with arguments', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        bot.use(builder.Middleware.firstRun({ version: 1.0, dialogId: '*:/firstRun' }));

        bot.dialog('/', root);
        bot.dialog('/firstRun', firstRun);
        bot.dialog('/setTimezone', setTimezone);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.FIRST_RUN);
            done();
        });

        connector.processMessage('start');
    });
});