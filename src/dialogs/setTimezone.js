const builder = require('botbuilder');
const moment = require('moment-timezone');
const googleMapsClient = require('../api_clients/googleMapsClient');
const consts = require('../helpers/consts');
const getRandomReminderMessage = require('../helpers/utils').getRandomReminder;

module.exports = [
    // Prompt user to enter the name of the city they live in
    (session, args) => {
        const prompt = args && args.prompt ? args.prompt : consts.Prompts.ASK_CITY;
        builder.Prompts.text(session, prompt);
    },
    // Use Geocoding API to retrieve location coordinates
    (session, results, next) => {
        const city = session.dialogData.city = results.response;

        // Try to geocode the name of the city
        googleMapsClient.geocode({ address: city }, (err, response) => {
            if (err) {
                return session.error(err);
            }
            // Cache the geocoding results
            session.dialogData.geocoding = response.json.results;
            next();
        });
    },
    // Determine if the user should be prompted to try again or make a choice
    (session, results, next) => {
        const geocoding = session.dialogData.geocoding;
        const numberOfResults = geocoding.length;

        if (numberOfResults === 0) {
            // Re-prompt user to enter a city
            session.replaceDialog('/setTimezone', { prompt: consts.Prompts.ASK_CITY_RETRY })
        } else if (numberOfResults > 1) {
            const adresses = geocoding.reduce((addresses, result) => {
                addresses.push(result.formatted_address);
                return addresses;
            }, []);

            // Prompt user to choose from the available results
            session.send(consts.Messages.MULTIPLE_CITIES_FOUND, session.dialogData.city);
            builder.Prompts.choice(session,
                consts.Prompts.CHOOSE_CITY,
                adresses,
                {
                    listStyle: builder.ListStyle.list,
                    retryPrompt: consts.Prompts.LIST_RETRY
                });
        } else {
            next();
        }

    },
    // Use Geocoding Timezone API
    (session, results) => {
        const geocoding = session.dialogData.geocoding;
        const { response } = results;
        const index = (response && response.hasOwnProperty('index')) ? response.index : 0;
        const location = geocoding[index].geometry.location;

        googleMapsClient.timezone({ location }, (err, response) => {
            if (err) {
                return session.error(err);
            }

            const { dstOffset, rawOffset, timeZoneId, timeZoneName } = response.json;
            // Cache the timezone result as userData
            session.userData.timeZoneData = { dstOffset, rawOffset, timeZoneId, timeZoneName };
            const time = moment.tz(timeZoneId).format('h:mm a');
            session.endDialog(consts.Messages.TIMEZONE_CHANGED, time, getRandomReminderMessage());
        });
    }
];