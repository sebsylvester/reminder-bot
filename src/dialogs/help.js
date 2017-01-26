const builder = require('botbuilder');
const consts = require('../helpers/consts');
const helpMenu = consts.Menus.help;

// This alternative dialog will present the buttons as Quick Replies in Facebook Messenger
// https://developers.facebook.com/docs/messenger-platform/send-api-reference/quick-replies
// const dialog = [
//     (session) => {
//         // In case you need Quick Reply buttons
//         builder.Prompts.choice(session,
//             consts.Prompts.HELP,
//             // Extract the titles from the help menu, they will be used as button labels
//             consts.Menus.help.map(el => 'foo'),
//             // Options
//             {
//                 listStyle: builder.ListStyle.button,
//                 retryPrompt: consts.Prompts.LIST_RETRY
//             }
//         );
//     },
//     (session, results) => {
//         const index = results.response && results.response.index;
//         if (typeof index === 'undefined') {
//             return session.endDialog();
//         }

//         session.beginDialog(helpMenu[index].dialogId);
//     }
// ];

// This dialog will create a Button Template in Facebook Messenger
// https://developers.facebook.com/docs/messenger-platform/send-api-reference/button-template
module.exports = (session) => {
    const card = new builder.ThumbnailCard(session)
        .buttons(consts.Menus.help.map(el => builder.CardAction.imBack(session, el.title, el.title)));

    const message = new builder.Message(session)
        .text(consts.Prompts.HELP)
        .addAttachment(card);

    // The bot's global action handlers will intercept the tapped button event
    session.endDialog(message);
};