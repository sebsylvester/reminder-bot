const config = require('../../config');

const key = process.env.GOOGLE_MAPS_API_KEY || config.GOOGLE_MAPS_API_KEY;
const googleMapsClient = require('@google/maps').createClient({ key });

module.exports = googleMapsClient;