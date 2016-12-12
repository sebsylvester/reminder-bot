const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user_address: { type: Object, required: true, index: true },
    value: { type: String, required: true },
    expiration: { type: Date, required: true }
});

module.exports = mongoose.model('Reminder', reminderSchema);