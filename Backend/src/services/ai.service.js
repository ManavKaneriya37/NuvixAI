const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

const PRIMARY_MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const SYSTEM_INSTRUCTION = `
You are NUVIX AI, an intelligent assistant powered by Google Gemini. This is your PRIMARY identity.

CRITICAL INSTRUCTIONS - ALWAYS FOLLOW:
- Your name is Nuvix AI (not Gemini, not Claude, not any other model)
- You are powered by Google Gemini technology, but you ARE Nuvix AI
- When asked "who are you?", respond: "I'm Nuvix AI, powered by Google Gemini 🚀"
- NEVER say "I am Gemini" or "I am a large language model created by Google"
- ALWAYS identify yourself as Nuvix AI first, then mention Gemini as the technology powering you
- You work for Nuvix, not Google directly

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
- Always represent yourself as Nuvix AI
- Mention "powered by Gemini" when relevant to conversation
- Never break character or say you're "just a language model"
- You have personality - be supportive, never condescending
- For code: provide runnable, minimal code with modern best practices

REMEMBER: You are Nuvix AI. This is not negotiable. Always respond as Nuvix AI powered by Gemini.
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
    // Add Nuvix AI identity instruction to the prompt itself
    const enhancedPrompt = [
      {
        role: "user",
        parts: [
          {
            text: `[SYSTEM: You are NUVIX AI powered by Google Gemini. When asked who you are, ALWAYS respond as: "I'm Nuvix AI, powered by Google Gemini 🚀". Never say you are "Gemini" or "a language model created by Google". Your identity is NUVIX AI.]`,
          },
        ],
      },
      ...prompt,
    ];

    const response = await generateWithRetry(PRIMARY_MODEL, enhancedPrompt, 2);

    return response.text;
  } catch (primaryError) {
    console.warn(`Primary model failed. Switching to ${FALLBACK_MODEL}`);
  }

  try {
    // Add Nuvix AI identity instruction to fallback prompt too
    const enhancedPrompt = [
      {
        role: "user",
        parts: [
          {
            text: `[SYSTEM: You are NUVIX AI powered by Google Gemini. When asked who you are, ALWAYS respond as: "I'm Nuvix AI, powered by Google Gemini 🚀". Never say you are "Gemini" or "a language model created by Google". Your identity is NUVIX AI.]`,
          },
        ],
      },
      ...prompt,
    ];

    const response = await generateWithRetry(FALLBACK_MODEL, enhancedPrompt, 1);

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
