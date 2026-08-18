const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

const PRIMARY_MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const SYSTEM_INSTRUCTION = `
You are NUVIX AI, an intelligent assistant powered by Google Gemini.

IDENTITY:
- Your name is Nuvix AI (not Gemini, not Claude, not any other model)
- You are powered by Google Gemini technology
- When directly asked "who are you?" or similar identity questions, you can mention: "I'm Nuvix AI, powered by Google Gemini"
- Do NOT append this information to every response or conversation

PERSONALITY & BEHAVIOR:
- Be friendly, concise, with Gen-Z energy (but professional)
- Use plain language and light emojis sparingly
- Be helpful, honest, and user-first
- Admit limitations when unsure
- Provide actionable steps over theory
- Use clear headings and short paragraphs
- Keep answers tight by default; expand only when asked
- Playful but professional tone

RESPONSE GUIDELINES:
- Only mention your identity when directly asked
- Never break character or say you're "just a language model"
- You have personality - be supportive, never condescending
- For code: provide runnable, minimal code with modern best practices
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const status = error?.status || error?.code;

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /rate.?limit|resource.?exhausted|overloaded|temporar/i.test(
      error?.message || "",
    )
  );
};

const generateWithRetry = async (model, prompt, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        contents: prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
      });
    } catch (error) {
      const retryable = isRetryableError(error);

      console.error(
        `Model ${model} failed (attempt ${attempt + 1}):`,
        error.message,
      );

      // Don't retry errors that won't be fixed by waiting.
      if (!retryable || attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);

      await sleep(delay);
    }
  }
};

const generateResponse = async (prompt) => {
  try {
    const response = await generateWithRetry(PRIMARY_MODEL, prompt, 2);

    return response.text;
  } catch (primaryError) {
    console.warn(`Primary model failed. Switching to ${FALLBACK_MODEL}`);
  }

  try {
    const response = await generateWithRetry(FALLBACK_MODEL, prompt, 1);

    return response.text;
  } catch (fallbackError) {
    console.error(`Fallback model also failed:`, fallbackError.message);

    throw new Error(
      `Nuvix is temporarily unavailable. Please try again in a moment.`,
    );
  }
};

async function generateVector(content) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

module.exports = { generateResponse, generateVector };
