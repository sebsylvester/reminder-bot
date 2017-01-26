const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const { setDatetime } = require('../src/dialogs');

describe('dialog /setDatetime', function () {
    it('should exit the dialog with an error if the arguments does not contain a reminder', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        bot.on('error', error => {
            expect(error.message).to.equal('Invalid arguments object: reminder property is undefined');
            done();
        });
        bot.dialog('/', (session) => session.beginDialog('/setDatetime', {}));
        bot.dialog('/setDatetime', setDatetime);

        connector.processMessage('start');
    });

    it('should prompt the user to enter a date/time for the reminder', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const reminder = 'make coffee';

        bot.dialog('/', (session) => session.beginDialog('/setDatetime', { reminder }));
        bot.dialog('/setDatetime', setDatetime);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.ASK_DATETIME.replace(/%s/, reminder));
            done()
        });

        connector.processMessage('start');
    });

    it('should restart the dialog if the user has failed to enter a date/time', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const reminder = 'make coffee';
        var step = 0;

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        const { witClient } = require('../src/helpers/witRecognizer');
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

        bot.dialog('/', (session) => session.beginDialog('/setDatetime', { reminder }));
        bot.dialog('/setDatetime', setDatetime);

        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    expect(message.text).to.equal(consts.Prompts.ASK_DATETIME.replace(/%s/, reminder));
                    connector.processMessage('foo');
                    break;
                case 2:
                    expect(message.text).to.equal(consts.Prompts.ASK_DATETIME_RETRY.replace(/%s/, reminder));
                    witClient.message.restore();
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });

    it('should detect a datetime entity in the user\'s respone', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const response = {
            "_text" : "in 30 minutes",
            "entities" : {
                "datetime" : [ {
                    "confidence" : 0.9817748270652593,
                    "type" : "value",
                    "value" : "2016-12-06T19:04:21.000Z",
                    "grain" : "second",
                    "values" : [ {
                        "type" : "value",
                        "value" : "2016-12-06T19:04:21.000Z",
                        "grain" : "second"
                    } ]
                } ]
            }
        };

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        const { witClient } = require('../src/helpers/witRecognizer');
        sinon.stub(witClient, 'message', () => Promise.resolve(response));

        bot.dialog('/', [
            (session) => session.beginDialog('/setDatetime', { reminder: 'make coffee' }),
            (session, results) => {
                expect(results.datetime).to.equal(response.entities.datetime[0].value);
                expect(results.text).to.equal(response._text);
                witClient.message.restore();
                done();
            }
        ]);
        bot.dialog('/setDatetime', setDatetime);

        bot.on('send', function () {
            // Respond to the bot's prompt for a date/time
            connector.processMessage('in 30 minutes');
        });

        connector.processMessage('start');
    });

    it('should send an error message if the create operation fails', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        let step = 0;

        // Replace the message method with a stub that produces an error
        const { witClient } = require('../src/helpers/witRecognizer');
        sinon.stub(witClient, 'message', () => Promise.reject(new Error('Something failed')));

        bot.dialog('/', (session) => {
            session.beginDialog('/setDatetime', { reminder: 'make coffee' });
        });
        bot.dialog('/setDatetime', setDatetime);

        bot.on('send', function (message) {
            switch(++step) {
                case 1:
                    connector.processMessage('in 30 minutes');
                    break;
                case 2:
                    expect(message.text).to.equal('Oops. Something went wrong and we need to start over.');
                    witClient.message.restore();
                    done();
            }
        });

        connector.processMessage('start');
    });
});