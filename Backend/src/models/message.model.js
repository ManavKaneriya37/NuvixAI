const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "model", "system"],
        default: "user",
    }
}, {timestamps: true});

// Compound index for optimized chat queries
messageSchema.index({ chat: 1, createdAt: -1 });
// Index for user message retrieval
messageSchema.index({ user: 1, createdAt: -1 });

const messageModel = mongoose.model("Message", messageSchema);

module.exports = messageModel;

