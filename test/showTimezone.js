const expect = require('chai').expect;
const builder = require('botbuilder');
const consts = require('../src/helpers/consts');
const helpMenu = consts.Menus.help;
const timeZoneData = {
    "dstOffset" : 0,
    "rawOffset" : 3600,
    "timeZoneId" : "Europe/Paris",
    "timeZoneName" : "Central European Standard Time"
};

describe('dialog /showTimezone', function () {
    it('should respond with the user\'s timezone when available', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        helpMenu.forEach(item => {
            const name = item.dialogId.slice(1);
            bot.beginDialogAction(name, item.dialogId, { matches: new RegExp('^' + item.title + '$', 'i')});
        });

        bot.use({
            botbuilder: function (session, next) {
                session.userData.timeZoneData = {
                    "dstOffset" : 0,
                    "rawOffset" : 3600,
                    "timeZoneId" : "Europe/Paris",
                    "timeZoneName" : "Central European Standard Time"
                };
                next();
            }
        });
        bot.dialog('/', require('../src/dialogs/root'));
        bot.dialog('/showTimezone', require('../src/dialogs/showTimezone'));

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Messages.CURRENT_TIMEZONE.replace(/%s/, timeZoneData.timeZoneName));
            done();
        });

        connector.processMessage('Show timezone');
    });

    it('should prompt the user to set timezone if necessary', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        helpMenu.forEach(item => {
            const name = item.dialogId.slice(1);
            bot.beginDialogAction(name, item.dialogId, { matches: new RegExp('^' + item.title + '$', 'i')});
        });

        bot.dialog('/', require('../src/dialogs/root'));
        bot.dialog('/showTimezone', require('../src/dialogs/showTimezone'));

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.SET_TIMEZONE);
            done();
        });

        connector.processMessage('Show timezone');
    });

    it('should redirect to /setTimezone if the user selects "yes" to previous prompt', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        helpMenu.forEach(item => {
            const name = item.dialogId.slice(1);
            bot.beginDialogAction(name, item.dialogId, { matches: new RegExp('^' + item.title + '$', 'i')});
        });

        bot.dialog('/', require('../src/dialogs/root'));
        bot.dialog('/showTimezone', require('../src/dialogs/showTimezone'));
        bot.dialog('/setTimezone', require('../src/dialogs/setTimezone'));
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    connector.processMessage('yes');
                    break;
                case 2:
                    expect(message.text).to.equal(consts.Prompts.ASK_CITY);
                    done();
                    break;
            }
        });

        connector.processMessage('Show timezone');
    });

    it('should redirect to /setTimezone if the user selects "no" to previous prompt', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        helpMenu.forEach(item => {
            const name = item.dialogId.slice(1);
            bot.beginDialogAction(name, item.dialogId, { matches: new RegExp('^' + item.title + '$', 'i')});
        });

        bot.dialog('/', require('../src/dialogs/root'));
        bot.dialog('/showTimezone', require('../src/dialogs/showTimezone'));
        bot.dialog('/setTimezone', require('../src/dialogs/setTimezone'));
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    connector.processMessage('no');
                    break;
                case 2:
                    expect(message.text).to.equal(consts.Messages.CANCEL_TIMEZONE);
                    done();
                    break;
            }
        });

        connector.processMessage('Show timezone');
    });
});