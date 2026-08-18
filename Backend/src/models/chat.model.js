const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }

}, {timestamps: true});

// Compound index for optimized chat retrieval sorted by lastActivity
chatSchema.index({ user: 1, lastActivity: -1 });

const chatModel = mongoose.model('Chat', chatSchema);

module.exports = chatModel;
