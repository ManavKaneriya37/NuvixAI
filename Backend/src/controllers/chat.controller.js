const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

async function createChat(req, res) {
  try {
    const { title } = req.body;
    const userId = req.user._id;

    const newChat = new Chat({
      user: userId,
      title: title,
    });

    const savedChat = await newChat.save();
    res.status(201).json({
      message: "Chat created successfully",
      chat: {
        _id: savedChat._id,
        title: savedChat.title,
        lastActivity: savedChat.lastActivity,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating chat", error: error.message });
  }
}

async function getChats(req, res) {
  try {
    const user = req.user;

    const chats = await Chat.find({ user: user._id })
      .select("_id title lastActivity")
      .sort({ lastActivity: -1 })
      .lean();

    res.status(200).json({
      message: "Chats retrieved successfully.",
      chats: chats.map((chat) => ({
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user: chat.user,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in loading chats.",
      success: false,
      error: error.message,
    });
  }
}

async function getMessages(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, user: req.user._id });

    if (!chat) return res.status(404).json({ message: "Chat not found." });

    const messages = await Message.find({ chat: chat._id })
      .select("_id content role createdAt")
      .sort({ createdAt: 1 })
      .lean();
    
    return res.status(200).json({
      messages: messages.map((message) => ({
        _id: message._id,
        content: message.content,
        role: message.role,
        createdAt: message.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Error loading messages." });
  }
}

async function renameChat(req, res) {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({ message: "A chat title is required." });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user._id },
      { title },
      { new: true, runValidators: true },
    );

    if (!chat) return res.status(404).json({ message: "Chat not found." });

    return res.status(200).json({
      message: "Chat renamed successfully.",
      chat: {
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error renaming chat." });
  }
}

async function deleteChat(req, res) {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      user: req.user._id,
    });

    if (!chat) return res.status(404).json({ message: "Chat not found." });

    await Message.deleteMany({ chat: chat._id });
    return res.status(200).json({ message: "Chat deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting chat." });
  }
}

module.exports = { createChat, getChats, getMessages, renameChat, deleteChat };
