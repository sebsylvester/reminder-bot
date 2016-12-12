# reminder-bot

This is a clone of the [Hello Jarvis](https://facebook.com/helloimjarvis/) Facebook Messenger bot, built with the [Microsoft Bot Framework](https://dev.botframework.com/) and [Wit.ai](https://wit.ai) for language processing. It has the the exact same functionality and it required just 600 lines of code to implement.

## Prerequisites
There are a number of things you'll need to do before running the bot:
* Register your bot on the Bot Framework's [Developer Portal](https://dev.botframework.com/bots/new). You might need to create an account first.
* Create an App ID and password for your bot.
* Get a [Google Maps](https://developers.google.com/maps/web-services/) api key and activate the Geocoding and Time Zone API's in the [Google API Console](https://console.cloud.google.com/).
* Get a [Wit.ai](https://wit.ai) account and create a new app from the backup file that is included in the repo's resources directory.
* Get the Wit.ai Server Access Token from your app's settings page.
* Install MongoDB. By default the bot will connect to a database named 'dev'. Create it with ```use dev``` from the mongo shell, or change the connection uri to select a different database.

## Configuring the bot
The keys acquired from the previous section need to be passed to the bot via config.json in the project's root directory.

## Using the bot with the Bot Framework Emulator
* Install the [Bot Framework Emulator](https://docs.botframework.com/en-us/tools/bot-framework-emulator/)
* Set the endpoint url to http://localhost:3978/api/messages and enter your App Id and App Password.

![Set endpoint](https://cloud.githubusercontent.com/assets/3374297/21108231/cf2f3340-c094-11e6-8870-3ca4cfe2f8a6.png)

![Set App Id and password](https://cloud.githubusercontent.com/assets/3374297/21108232/cf6547be-c094-11e6-86cc-2b992ecb0a45.png)

* Make sure you have MongoDB up and running before starting up the bot
* Run some usual npm commands:

```
$ npm install
$ npm run build
$ npm start
```
* Connect the emulator

## Using the bot with Facebook Messenger
By default, the Skype and Web Chat channels are already configured when registering a new bot. However, I noticed that the Skype client does not yet support all the features used by the bot.

Setting up the FB Messenger channel involves a daunting number of steps. Fortunately, the Dev Portal does a good job at keeping things clear and gives a good overview of all the steps, and much of them are illustrated with screenshots.

The bot needs to be either deployed to a cloud service like Heroku, or must be running locally and connected made accessible to the outside world with [ngrok](https://ngrok.com/).
Setting up ngrok is easy. Once installed run '''ngrok http 3978''' from the command line and copy the secure URL (https). From the Developer Portal, configure your bot's Messaging Endpoint with the ngrok URL. **NOTE:** you must add **/api/messages** to the URL. This is your bot's endpoint which receives all incoming messages.

### Known issue with FB Messenger for Android
I've tested the bot on Messenger's iOS, web and Android clients, and the latter seems to have an issue with the 'typing' indicator. After receiving the message from the bot, it doesn't disappear. I expect this to be a a bug in the Android client, rather than my code or the SDK's' for that matter.
