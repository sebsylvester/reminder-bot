const config = require('../../config');

const accessToken = process.env.WIT_ACCESS_TOKEN || config.WIT_ACCESS_TOKEN;
const Wit = require('node-wit').Wit;

module.exports = new Wit({ accessToken });