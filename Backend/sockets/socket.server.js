const { Server } = require("socket.io");
const User = require("../models/user.model");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");

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

      await messageModel.create({
        user: socket.user._id,
        chat,
        content,
        role: "user",
      });

      const chatHistory = await messageModel
        .find({ chat })
        .sort({ createdAt: 1 })
        .limit(10)
        .lean()
        .reverse()
        
      const response = await aiService.generateResponse(
        chatHistory.map((item) => {
          return {
            role: item.role,
            parts: [{ text: item.content }],
          };
        }),
      );

      await messageModel.create({
        user: socket.user._id,
        chat,
        content: response,
        role: "model",
      });

      socket.emit("ai-response", {
        content: response,
        chat,
      });
    });
  });
}

module.exports = initSocketServer;
