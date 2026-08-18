const aiService = require("../services/ai.service");
const { createMemory } = require("../services/vector.service");
const Message = require("../models/message.model");
const Chat = require("../models/chat.model");

/**
 * Generate vector embeddings and save to Pinecone in background
 * Does not block the response to user
 */
async function backgroundVectorGeneration(messageId, content, chatId, userId) {
  try {
    const vectors = await aiService.generateVector(content);
    
    await createMemory({
      vectors,
      messageId: messageId,
      metadata: {
        chat: String(chatId),
        user: String(userId),
        text: content,
      },
    });
    
  } catch (error) {
    console.error(`✗ Background: Failed to generate vectors for ${messageId}:`, error.message);
    // Don't throw - this is non-critical for user experience
  }
}

/**
 * Update chat lastActivity in background
 * Non-blocking operation
 */
async function backgroundUpdateChatActivity(chatId) {
  try {
    await Chat.findByIdAndUpdate(chatId, { lastActivity: new Date() }, { new: false });
  } catch (error) {
    console.error(`✗ Background: Failed to update chat activity:`, error.message);
  }
}

module.exports = {
  backgroundVectorGeneration,
  backgroundUpdateChatActivity,
};
