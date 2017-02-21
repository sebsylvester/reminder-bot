const { WitRecognizer } = require('botbuilder-wit');
const config = require('../../config');

exports.witRecognizer = new WitRecognizer(process.env.WIT_ACCESS_TOKEN || config.WIT_ACCESS_TOKEN);
exports.witClient = exports.witRecognizer.witClient;