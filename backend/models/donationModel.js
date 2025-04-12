const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign', // Reference to the Campaign model
        required: true,
    },
    donatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Donation', donationSchema);