const builder = require('botbuilder');
const consts = require('../helpers/consts');
const helpMenu = consts.Menus.help;

module.exports = [
    (session) => {
        builder.Prompts.choice(session,
            consts.Prompts.HELP,
            // Extract the titles from the help menu, they will be used as button labels
            consts.Menus.help.map(el => el.title),
            // Options
            {
                listStyle: builder.ListStyle.button,
                retryPrompt: consts.Prompts.LIST_RETRY
            }
        );
    },
    (session, results) => {
        const index = results.response && results.response.index;
        if(typeof index === 'undefined') {
            return session.endDialog();
        }

        session.beginDialog(helpMenu[index].dialogId);
    }
];