const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const { witClient } = require('../src/helpers/witRecognizer');

describe('dialog /', function () {
    it('should respond to a greeting', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        const botResponse = new RegExp('^(' + consts.Messages.GREETINGS.join('|') + ') Try something like: .+, or type "help"\.');

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        sinon.stub(witClient, 'message', () => {
            const witResponse = {
                "_text" : "Hello",
                "entities" : {
                    "greeting" : [ {
                        "confidence" : 0.9801770696107365,
                        "type" : "value",
                        "value" : "Hello"
                    } ]
                }
            };
            return Promise.resolve(witResponse);
        });

        bot.dialog('/', require('../src/dialogs/root'));

        bot.on('send', function (message) {
            expect(message.text).to.match(new RegExp('^(' + consts.Messages.GREETINGS.join('|') + ')'));
            expect(message.text).to.match(/Try something like: .+, or type "help"\./);
            witClient.message.restore();
            done();
        });

        connector.processMessage('Hello');
    });

    it('should respond with a default message if the user is not understood', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        sinon.stub(witClient, 'message', () => {
            const response = {
                "_text": "What's the weather tomorrow?",
                "entities": {
                    "reminder": [{
                        "confidence": 0.994554597770477,
                        "type": "value",
                        "value": "What's the weather",
                        "suggested": true
                    }],
                    "datetime": [{
                        "confidence": 0.9976394228258594,
                        "type": "value",
                        "value": "2016-12-07T00:00:00.000Z",
                        "grain": "day",
                        "values": [{
                            "type": "value",
                            "value": "2016-12-07T00:00:00.000Z",
                            "grain": "day"
                        }]
                    }]
                }
            };
            return Promise.resolve(response);
        });

        bot.dialog('/', require('../src/dialogs/root'));

        bot.on('send', function (message) {
            expect(message.text).to.match(new RegExp('Oops, I didn\'t get that. Try something like: .+, or type "help"\.'));
            witClient.message.restore();
            done();
        });

        connector.processMessage('What\'s the weather tomorrow?');
    });
});