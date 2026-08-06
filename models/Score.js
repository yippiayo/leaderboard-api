const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true,
        unique: true
    },

    username: {
        type: String,
        required: true
    },

    bestTime: {
        type: Number,
        required: true
    },

    totalRace: {
        type: Number,
        default: 1
    },

    checkpoint: {
        type: Number,
        default: 2
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Score", scoreSchema);