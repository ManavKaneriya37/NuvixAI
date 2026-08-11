const Chat = require('../models/chat.model');

async function createChat(req, res) {
    try {
        const { title } = req.body;
        const userId = req.user._id;

        const newChat = new Chat({
            user: userId,
            title: title,
        });

        const savedChat = await newChat.save();
        res.status(201).json({message: "Chat created successfully", chat: {
            _id: savedChat._id,
            title: savedChat.title,
            lastActivity: savedChat.lastActivity,
        }});
    } catch (error) {
        res.status(500).json({ message: "Error creating chat", error: error.message });
    }
}

module.exports = { createChat };