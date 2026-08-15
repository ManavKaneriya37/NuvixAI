const { Server } = require("socket.io");
const User = require("../models/user.model");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    if (!cookies.token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      socket.user = user;
      next();
    } catch (err) {
      console.log(err.message);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      const { content, chat } = messagePayload;

      const message = await messageModel.create({
        user: socket.user._id,
        chat,
        content,
        role: "user",
      });

      const vectors = await aiService.generateVector(messagePayload.content);

      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      // Select the newest messages, then restore chronological order for Gemini.
      // Sorting oldest-first before applying `limit` kept sending only the first
      // messages in a chat; reversing that result also made the conversation run
      // backwards.
      const chatHistory = await messageModel
        .find({ chat })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const chronologicalChatHistory = chatHistory.reverse();

      const response = await aiService.generateResponse(
        chronologicalChatHistory.map((item) => {
          return {
            role: item.role,
            parts: [{ text: item.content }],
          };
        }),
      );

      const responseMessage = await messageModel.create({
        user: socket.user._id,
        chat,
        content: response,
        role: "model",
      });

      const responseVectors = await aiService.generateVector(response);

      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        }, 
      });

      socket.emit("ai-response", {
        content: response,
        chat,
      });
    });
  });
}

module.exports = initSocketServer;
