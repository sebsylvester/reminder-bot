const expect = require('chai').expect;
const builder = require('botbuilder');
const sinon = require('sinon');
const consts = require('../src/helpers/consts');
const { root, setTimezone } = require('../src/dialogs');
const googleMapsClient = require('../src/api_clients/googleMapsClient');
const geocodeMock = (params, callback) => {
    // One result for each test
    const results = [
        [{
            formatted_address: "London, UK",
            geometry: {
                location: {
                    lat : 51.5073509,
                    lng : -0.1277583
                }
            }
        }],
        [{
            formatted_address: "Paris, France",
            geometry: {
                location: {
                    lat : 48.856614,
                    lng : 2.3522219
                }
            }
        },{
            formatted_address: "Paris, TX, USA",
            geometry: {
                location: {
                    lat : 33.6609389,
                    lng : -95.55551299999999
                }
            }
        }],
        []
    ];

    switch (params.address) {
        case 'error':
            callback(new Error('Something failed'));
            break;
        case 'London':
            callback(null, { json: { results: results[0] }});
            break;
        case 'Paris':
            callback(null, { json: { results: results[1] }});
            break;
        default :
            callback(null, { json: { results: results[2] }});
    }
};
const timezoneMock = (params, callback) => {
    const locations = [
        {
            lat : 48.856614,
            lng : 2.3522219
        },
        {
            lat : 51.5073509,
            lng : -0.1277583
        }
    ];

    const results = [
        {
            dstOffset : 0,
            rawOffset : 3600,
            timeZoneId : "Europe/Paris",
            timeZoneName : "Central European Standard Time",
        },
        {
            dstOffset : 0,
            rawOffset : 0,
            timeZoneId : "Europe/London",
            timeZoneName : "Greenwich Mean Time"
        }
    ];

    if(params.location.lat === locations[0].lat && params.location.lng === locations[0].lng) {
        callback(null, { json: results[0] });
    } else if(params.location.lat === locations[1].lat && params.location.lng === locations[1].lng) {
        callback(null, { json: results[1] });
    }
};

describe('dialog /setTimezone', function () {
    before(function () {
        sinon.stub(googleMapsClient, 'geocode', geocodeMock);
        sinon.stub(googleMapsClient, 'timezone', timezoneMock);
    });

    after(function () {
        googleMapsClient.geocode.restore();
        googleMapsClient.timezone.restore();
    });

    it('should begin /setTimezone when receiving "Change timezone', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        const { witClient } = require('../src/helpers/witRecognizer');
        sinon.stub(witClient, 'message', () => {
            const response = {
                "_text": "Change timezone",
                "entities": {
                    "reminder": [{
                        "confidence": 0.9578046403316199,
                        "type": "value",
                        "value": "Change timezone",
                        "suggested": true
                    }],
                    "intent": [{
                        "confidence": 0.99089726036363,
                        "value": "set_timezone"
                    }]
                }
            };
            return Promise.resolve(response);
        });

        bot.dialog('/', root);
        bot.dialog('/setTimezone', setTimezone);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.ASK_CITY);
            witClient.message.restore();
            done();
        });

        connector.processMessage('Change timezone');
    });

    it('should begin /setTimezone when receiving "Update timezone', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);

        // Replace the message method with a stub that mocks the response to prevent actual api calls
        const { witClient } = require('../src/helpers/witRecognizer');
        sinon.stub(witClient, 'message', () => {
            const response = {
                "_text": "Change timezone",
                "entities": {
                    "reminder": [{
                        "confidence": 0.9578046403316199,
                        "type": "value",
                        "value": "Change timezone",
                        "suggested": true
                    }],
                    "intent": [{
                        "confidence": 0.99089726036363,
                        "value": "set_timezone"
                    }]
                }
            };
            return Promise.resolve(response);
        });

        bot.dialog('/', root);
        bot.dialog('/setTimezone', setTimezone);

        bot.on('send', function (message) {
            expect(message.text).to.equal(consts.Prompts.ASK_CITY);
            witClient.message.restore();
            done();
        });

        connector.processMessage('Update timezone');
    });

    /**
     * This test covers the following scenario:
     * 1. The user types a city that can not be found with Google Maps Geocoding API, resulting in a dialog loop.
     * 2. The user types a city that results in multiple results, which results in a prompt to make a choice.
     * 3. The user makes a choice and the Google Maps Timezone API retrieves the corresponding timezone.
     */
    it('should count 5 steps to complete this scenario', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        bot.dialog('/', builder.DialogAction.beginDialog('/setTimezone'));
        bot.dialog('/setTimezone', setTimezone)
            .cancelAction('cancelSetTimezone', consts.Messages.CANCEL_TIMEZONE, { matches: /^(cancel|nevermind)/i });

        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    expect(message.text).to.equal(consts.Prompts.ASK_CITY);
                    connector.processMessage('FooBar');
                    break;
                case 2:
                    expect(message.text).to.equal(consts.Prompts.ASK_CITY_RETRY);
                    connector.processMessage('Paris');
                    break;
                case 3:
                    expect(message.text).to.equal(consts.Messages.MULTIPLE_CITIES_FOUND.replace(/%s/, 'Paris'));
                    break;
                case 4:
                    expect(message.text.match(/^Enter the number that corresponds with your city\./)).to.be.ok;
                    expect(message.text).to.match(/^Enter the number that corresponds with your city\./);
                    expect(message.text).to.match(/1\. Paris, France/);
                    expect(message.text).to.match(/2\. Paris, TX, USA/);
                    connector.processMessage('1');
                    break;
                case 5:
                    expect(message.text).to.match(/^Thanks! I have your current time as.+/);
                    expect(message.text).to.match(/Now try something like: /);
                    expect(message.text).to.match(/.+, or type "help"\.$/);
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });

    /**
     * This test is a simpler version of the previous one and covers the following scenario:
     * 1. The user types a city that results in a single result.
     * 2. The user makes a choice and the Google Maps Timezone API retrieves the corresponding timezone.
     */
    it('should count 2 steps to complete this scenario', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        bot.dialog('/', function (session) {
            session.beginDialog('/setTimezone');
        });
        bot.dialog('/setTimezone', setTimezone);
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    expect(message.text).to.equal(consts.Prompts.ASK_CITY);
                    connector.processMessage('London');
                    break;
                case 2:
                    expect(message.text).to.match(/^Thanks! I have your current time as.+/);
                    expect(message.text).to.match(/Now try something like: /);
                    expect(message.text).to.match(/.+, or type "help"\.$/);
                    done();
            }
        });

        connector.processMessage('start');
    });

    it('should send an error message if the geocode operation fails', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        bot.dialog('/', function (session) {
            session.beginDialog('/setTimezone');
        });
        bot.dialog('/setTimezone', setTimezone);
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    expect(message.text).to.equal(consts.Prompts.ASK_CITY);
                    // triggers error response from mock
                    connector.processMessage('error');
                    break;
                case 2:
                    expect(message.text).to.equal('Oops. Something went wrong and we need to start over.');
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });

    it('should send an error message if the timezone operation fails', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        var step = 0;

        // Undo default stub, replace with one that simplifies the test
        googleMapsClient.timezone.restore();
        sinon.stub(googleMapsClient, 'timezone', (params, callback) => {
            callback(new Error('Something failed'));
        });

        bot.dialog('/', function (session) {
            session.beginDialog('/setTimezone');
        });
        bot.dialog('/setTimezone', setTimezone);
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    expect(message.text).to.equal(consts.Prompts.ASK_CITY);
                    connector.processMessage('London');
                    break;
                case 2:
                    expect(message.text).to.equal('Oops. Something went wrong and we need to start over.');
                    done();
                    break;
            }
        });

        connector.processMessage('start');
    });
});