const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user_address: {
        useAuth: Boolean,
        serviceUrl: String,
        bot: { 
            name: String, 
            id: String 
        },
        conversation: { 
            id: String, 
            isGroup: Boolean 
        },
        user: { 
            name: { type: String, index: true }, 
            id: String 
        },
        channelId: String,
        id: String
    },
    value: { type: String, required: true },
    expiration: { type: Date, required: true }
});

module.exports = mongoose.model('Reminder', reminderSchema);