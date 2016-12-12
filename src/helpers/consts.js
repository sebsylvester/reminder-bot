exports.Prompts = {
    ASK_CITY: 'Okay, tell me which city you live in.',
    ASK_CITY_RETRY: 'Sorry, I didn\'t get that, could you repeat the city you live in?',
    ASK_DATETIME: 'When would you like to be reminded to %s?',
    ASK_DATETIME_RETRY: 'Sorry, I couldn\'t understand that. When would you like to be reminded to %s? Say something like: "in two weeks, at 9pm tomorrow, or on the 25th."',
    CHOOSE_CITY: 'Enter the number that corresponds with your city.',
    FIRST_RUN: 'Hey there, I need your timezone to get started. Which city do you live in?',
    HELP: 'What can I help you with?',
    LIST_RETRY: 'Please choose an option from the list or type cancel.',
    NEED_TIMEZONE: 'Okay, first I will need to know which city you live in.',
    SET_TIMEZONE: 'Looks like you haven\'t set your timezone yet. Do you want to set it now?'
};

exports.Messages = {
    CANCEL_HELP: 'Okay, nevermind.',
    CANCEL_TIMEZONE: 'No problem, I\'ll just leave your timezone the way it is.',
    CONFIRM_REMINDER: 'Okay, I\'ll remind you to %s at %s.',
    CURRENT_TIMEZONE: 'Your current timezone is %s.',
    DEFAULT_RESPONSE: 'Oops, I didn\'t get that. Try something like: %s, or type "help".',
    EXAMPLE_REMINDERS: [
        'Remind me to go to the gym at 5pm today',
        'Remind me to go for a run tonight at 7pm',
        'Remind me to feed the cat in one hour',
        'Remind me to buy groceries on Saturday at 10:30am',
        'Remind me to take out the garbage tomorrow at 6pm',
        'Remind me to buy movie tickets tomorrow at 6pm',
        'Remind me to go to the team meeting at 4:30pm on Friday'
    ],
    GREETINGS: ['Sup?', 'Hi there!', 'Hello!', 'Hey.'],
    GREETING_RESPONSE: '%s Try something like: %s, or type "help".',
    MULTIPLE_CITIES_FOUND: 'I found a number of cities named %s.',
    REMINDER: 'Hey, you asked me to %s',
    REMINDER_DELETED: 'Reminder deleted.',
    REMINDER_ALREADY_DELETED: 'Oops, looks like that reminder was already deleted.',
    NO_REMINDERS: 'You do not have any active reminders. To create one, say something like: "%s"',
    TIMEZONE_CHANGED: 'Thanks! I have your current time as %s. Now try something like: "%s", or type "help".'
};

exports.Menus = {
    help: [
        { title: 'Show reminders', dialogId: '/showReminders' },
        { title: 'Show timezone', dialogId: '/showTimezone' },
        { title: 'Reset timezone', dialogId: '/setTimezone' }
    ]
};