const { Server } = require("socket.io");
const User = require("../models/user.model");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const Chat = require("../models/chat.model");
const { createMemory, queryMemory } = require("../services/vector.service");
const { backgroundVectorGeneration, backgroundUpdateChatActivity } = require("../utils/backgroundTasks");

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
      const startTime = Date.now();

      if (!content?.trim() || !chat) {
        return socket.emit("ai-error", { chat, message: "A chat and message are required." });
      }

      const ownsChat = await Chat.exists({ _id: chat, user: socket.user._id });
      if (!ownsChat) {
        return socket.emit("ai-error", { chat, message: "Chat not found." });
      }

      try {
        // Save user message and generate vector in parallel (non-blocking)
        const message = await messageModel.create({
          user: socket.user._id,
          chat,
          content,
          role: "user",
        });

        // Generate vector in background (don't await)
        backgroundVectorGeneration(message._id, content, chat, socket.user._id);
        
        // Update chat lastActivity in background (don't await)
        backgroundUpdateChatActivity(chat);

        // Query relevant memory (semantic search) and recent chat history in parallel
        const [memory, chronologicalChatHistory] = await Promise.all([
          queryMemory({
            // Use a zero vector as placeholder to get user context
            // Or implement a smarter query - for now we'll query by top results
            topK: 3,
            filter: {
              user: { $eq: String(socket.user._id) },
            },
          }).catch(() => []), // Graceful fallback if vector service fails
          
          messageModel
            .find({ chat })
            .select("role content")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

        // Build short-term memory (recent chat history)
        const stm = chronologicalChatHistory.map((item) => {
          return {
            role: item.role,
            parts: [{ text: item.content }],
          };
        });

        // Build long-term memory (semantic search results)
        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `
These are some previous messages from the chat, use them to generate a response

${memory.map((item) => item.metadata?.text || "").filter(Boolean).join("\n")}
            `,
              },
            ],
          },
        ];

        // Generate AI response
        const response = await aiService.generateResponse([...ltm, ...stm]);

        // Send response to user immediately
        socket.emit("ai-response", {
          content: response,
          chat,
        });

        const userTime = Date.now() - startTime;    

        // Save response message and generate its vector in background (non-blocking)
        const responseMessage = await messageModel.create({
          user: socket.user._id,
          chat,
          content: response,
          role: "model",
        });

        // Generate response vector in background (don't block user)
        backgroundVectorGeneration(responseMessage._id, response, chat, socket.user._id);

        const totalTime = Date.now() - startTime;

      } catch (error) {
        console.error("Error processing AI message:", error.message);
        socket.emit("ai-error", { chat, message: "Unable to process your message. Please try again." });
      }
    });
  });
}

module.exports = initSocketServer;
