const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

const generateResponse = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    temperature: 0.7,
  });

  return response.text;
};

module.exports = { generateResponse };
