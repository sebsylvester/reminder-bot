const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const { witClient } = require('../src/helpers/witRecognizer');
const { root } = require('../src/dialogs');

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

        bot.dialog('/', root);

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

        bot.dialog('/', root);

        bot.on('send', function (message) {
            expect(message.text).to.match(new RegExp('Oops, I didn\'t get that. Try something like: .+, or type "help"\.'));
            witClient.message.restore();
            done();
        });

        connector.processMessage('What\'s the weather tomorrow?');
    });

    it('should start the newReminder dialog when triggered by a "remind me to..." message', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        sinon.stub(witClient, 'message', () => {
            const response = {
                "msg_id" : "062ca822-a908-4251-9d0e-4d2b2f4d775c",
                "_text" : "Remind me to fix my code tomorrow at 9am",
                "entities" : {
                    "contact" : [ {
                        "confidence" : 0.8879074482092286,
                        "type" : "value",
                        "value" : "me",
                        "suggested" : true
                    } ],
                    "reminder" : [ {
                        "confidence" : 0.999883972367534,
                        "type" : "value",
                        "value" : "fix my code",
                        "suggested" : true
                    } ],
                    "datetime" : [ {
                        "confidence" : 0.9782094515015287,
                        "values" : [ {
                            "value" : "2017-01-27T09:00:00.000Z",
                            "grain" : "hour",
                            "type" : "value"
                        }, {
                            "value" : "2017-01-27T21:00:00.000Z",
                            "grain" : "hour",
                            "type" : "value"
                        } ],
                        "value" : "2017-01-27T09:00:00.000Z",
                        "grain" : "hour",
                        "type" : "value"
                    } ]
                }
            };
            return Promise.resolve(response);
        });

        bot.dialog('/', root);
        bot.dialog('/newReminder', (session, arguments) => {
            const { datetime, message, reminder } = arguments;
            expect(datetime).to.be.ok;
            expect(reminder).to.be.ok;
            expect(message).to.equal('Remind me to fix my code tomorrow at 9am');
            witClient.message.restore();
            done();
        });

        connector.processMessage('Remind me to fix my code tomorrow at 9am');
    });
});