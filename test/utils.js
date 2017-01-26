const expect = require('chai').expect;
const utils = require('../src/helpers/utils');
const consts = require('../src/helpers/consts');

describe('utils', function () {
    describe('getRandomReminder', function () {
        const reminder = utils.getRandomReminder();
        const allReminders = consts.Messages.EXAMPLE_REMINDERS;

        it('should return an example reminder', function () {
            var res = allReminders.find(el => el === reminder);
            expect(allReminders.find(el => el === reminder)).to.be.a('string');
        });
    });

    describe('getRandomGreeting', function () {
        const greeting = utils.getRandomGreeting();
        const allGreetings = consts.Messages.GREETINGS;

        it('should return an example greeting', function () {
            expect(allGreetings.find(el => el === greeting)).to.be.a('string');
        });
    });

    describe('getRandom', function () {
        const getRandom = utils.getRandom;

        it('should return an empty string for unknown entities', function () {
            expect(getRandom()).to.equal('');
        });
    });

    describe('convertTimestamp', function () {
        const { convertTimestamp } = utils;

        it('should return a readable string (1)', function () {
            const result = convertTimestamp('2016-11-27T08:30:00.000Z', 'Europe/Paris');
            const expected = '9:30 AM on Sunday, November 27';
            expect(result).to.equal(expected);
        });

        it('should return a readable string (2)', function () {
            const result = convertTimestamp('2016-11-27T19:45:00.000Z', 'Europe/Paris');
            const expected = '8:45 PM on Sunday, November 27';
            expect(result).to.equal(expected);
        });

        it('should return a readable string (3)', function () {
            const result = convertTimestamp('2016-11-27T22:15:00.000Z', 'Europe/Paris');
            const expected = '11:15 PM on Sunday, November 27';
            expect(result).to.equal(expected);
        });
    });

    describe('processDatetimeEntity', function () {
        const { processDatetimeEntity } = utils;

        it('should throw an error if invoked with an invalid argument', function () {
            var invokeWithObject = () => {
                processDatetimeEntity({});
            };
            expect(invokeWithObject).to.throw('Invalid argument: datetime must be an array');

            invokeWithObject = () => {
                processDatetimeEntity([]);
            };
            expect(invokeWithObject).to.throw('Invalid argument: datetime must be an array');
        });

        it('should not throw an error if invoked with a valid argument', function () {
            var invokeWithObject = () => {
                processDatetimeEntity([{type:'value', value:'2016-12-12T11:15:42+01:00'}]);
            };
            expect(invokeWithObject).to.not.throw('Invalid argument: datetime must be an array');
        });

        it('should return a string if the type of datetime is value', function () {
            const input = [{type:'value', value:'2016-12-12T11:15:42+01:00'}];
            const value = processDatetimeEntity(input);
            expect(value).to.equal(input[0].value);
        });

        it('should return a string if the type of datetime is interval', function () {
            const input = [{type:'interval', from: { value:'2016-12-12T11:15:42+01:00' }}];
            const value = processDatetimeEntity(input);
            expect(value).to.equal(input[0].from.value);
        });
    });
});