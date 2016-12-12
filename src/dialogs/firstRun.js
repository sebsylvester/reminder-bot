const consts = require('../helpers/consts');

module.exports = (session) => {
    session.beginDialog('/setTimezone', { prompt: consts.Prompts.FIRST_RUN });
};