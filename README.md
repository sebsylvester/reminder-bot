# reminder-bot

This is a clone of the [Hello Jarvis](https://facebook.com/helloimjarvis/) Facebook Messenger bot, built with the [Microsoft Bot Framework](https://dev.botframework.com/) and [Wit.ai](https://wit.ai) for language processing. It has the exact same functionality and it required just 600 lines of code to implement.

[![Build Status](https://travis-ci.org/sebsylvester/reminder-bot.svg?branch=master)](https://travis-ci.org/sebsylvester/reminder-bot)
[![codecov](https://codecov.io/gh/sebsylvester/reminder-bot/branch/master/graph/badge.svg)](https://codecov.io/gh/sebsylvester/reminder-bot)

## Prerequisites
* Get a [Google Maps](https://developers.google.com/maps/web-services/) api key and activate the Geocoding and Time Zone API's in the [Google API Console](https://console.cloud.google.com/).
* Get a [Wit.ai](https://wit.ai) account and create a new app from the backup file that is included in the repo's resources directory.
* Get the Wit.ai Server Access Token from your app's settings page.
* In the config.json file, enter the obtained tokens from Google and Wit.ai.
* Install MongoDB. By default the bot will connect to ```mongodb://localhost/dev```, but you can change the connection uri in the config file.

## Using the bot with the Bot Framework Emulator
* Install the [Bot Framework Emulator](https://docs.botframework.com/en-us/tools/bot-framework-emulator/)
* Set the endpoint url to http://localhost:3978/api/messages and, in case you have registered your bot, enter your App Id and App Password.

![Set endpoint](https://cloud.githubusercontent.com/assets/3374297/21108231/cf2f3340-c094-11e6-8870-3ca4cfe2f8a6.png)

* Make sure you have MongoDB up and running before starting up the bot
* Run some usual npm commands:

```
$ npm install
$ npm run build
$ npm start
```
* Connect the emulator