const restify = require('restify');
const builder = require('botbuilder');
const mongoose = require('mongoose');
const consts = require('./helpers/consts');
const config = require('../config');
const dialogs = require('./dialogs');
const createReminderProcessor = require('./helpers/reminderProcessor');

//=========================================================
// MongoDB Setup
//=========================================================

mongoose.connect(process.env.MONGO_URI || config.MONGO_URI, err => {
    if (err) {
        return console.error(err);
    }
    console.log("Connected to MongoDB");
});

//=========================================================
// Bot Setup
//=========================================================

// Create chat bot
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || config.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD || config.MICROSOFT_APP_PASSWORD
});
const bot = new builder.UniversalBot(connector);

//=========================================================
// Bots Middleware
//=========================================================

bot.use(builder.Middleware.firstRun({ version: 1.0, dialogId: '*:/firstRun' }));
bot.use(builder.Middleware.sendTyping());

//=========================================================
// Bots Global Actions
//=========================================================

// Make help menu buttons global actions so that they work regardless of the state of the dialog stack
consts.Menus.help.forEach(item => {
    const name = item.dialogId.slice(1);
    bot.beginDialogAction(name, item.dialogId, { matches: new RegExp('^' + item.title + '$', 'i')});
});
// Triggered upon tapping the delete button of a ThumbnailCard in the showReminders dialog
bot.beginDialogAction('deleteReminder', '/deleteReminder');

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', dialogs.root);
bot.dialog('/firstRun', dialogs.firstRun);
bot.dialog('/newReminder', dialogs.newReminder);
bot.dialog('/deleteReminder', dialogs.deleteReminder);
bot.dialog('/setDatetime', dialogs.setDatetime);
bot.dialog('/setTimezone', dialogs.setTimezone);
bot.dialog('/showTimezone', dialogs.showTimezone);
bot.dialog('/showReminders', dialogs.showReminders);
bot.dialog('/help', dialogs.help).triggerAction({ matches: /^help/i });

//=========================================================
// Server Setup
//=========================================================

const server = restify.createServer();

// Setup endpoint for incoming messages which will be passed to the bot's ChatConnector.
server.post('/api/messages', connector.listen());

// Start listening on 3978 by default
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

//=========================================================
// Setup interval to process expired reminders
//=========================================================

setInterval(createReminderProcessor(bot), 15000);
