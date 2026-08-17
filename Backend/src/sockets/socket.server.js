const { Server } = require("socket.io");
const User = require("../models/user.model");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const Chat = require("../models/chat.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
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

      if (!content?.trim() || !chat) {
        return socket.emit("ai-error", { chat, message: "A chat and message are required." });
      }

      const ownsChat = await Chat.exists({ _id: chat, user: socket.user._id });
      if (!ownsChat) {
        return socket.emit("ai-error", { chat, message: "Chat not found." });
      }

      try {
      const [message, vectors] = await Promise.all([

        messageModel.create({
          user: socket.user._id,
          chat,
          content,
          role: "user",
        }),

        aiService.generateVector(messagePayload.content),
      ]);

      await Chat.findByIdAndUpdate(chat, { lastActivity: new Date() });

      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: String(messagePayload.chat),
          user: String(socket.user._id),
          text: messagePayload.content,
        },
      });

      const [memory, chronologicalChatHistory] = await Promise.all([
        
        queryMemory({
          queryVector: vectors,
          topK: 3,
          filter: {
            user: { $eq: String(socket.user._id) },
          },
        }),

        messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .then((messages) => messages.reverse()),
      ]);

      const stm = chronologicalChatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `
              These are some previous messages from the chat, use them to generate a response

              ${memory.map((item) => item.metadata.text).join("\n")}
            `,
            },
          ],
        },
      ];

      const response = await aiService.generateResponse([...ltm, ...stm]);

      socket.emit("ai-response", {
        content: response,
        chat,
      });

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
          chat: String(messagePayload.chat),
          user: String(socket.user._id),
          text: response,
        },
      });
      } catch (error) {
        console.error("Error processing AI message:", error.message);
        socket.emit("ai-error", { chat, message: "Unable to process your message. Please try again." });
      }
    });
  });
}

module.exports = initSocketServer;
