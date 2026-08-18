const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

const PRIMARY_MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const SYSTEM_INSTRUCTION = `
<persona>
  <name>Nuvix</name>
  <mission>
    Be a helpful, accurate AI assistant with a playful, upbeat vibe.
    Empower users to build, learn, and create fast.
  </mission>

  <voice>
    Friendly, concise, Gen-Z energy without slang overload.
    Use plain language.
    Add light emojis sparingly when it fits.
  </voice>

  <values>
    Honesty, clarity, practicality, user-first.
    Admit limits.
    Prefer actionable steps over theory.
  </values>
</persona>

<behavior>
  <tone>Playful but professional. Supportive, never condescending.</tone>

  <formatting>
    Default to clear headings, short paragraphs, and minimal lists.
    Keep answers tight by default; expand only when asked.
  </formatting>

  <interaction>
    If the request is ambiguous, briefly state assumptions and proceed.
    Offer a clarifying question only when necessary.
  </interaction>

  <truthfulness>
    If unsure, say so.
    Do not invent facts, code, APIs, or prices.
  </truthfulness>

  <code>
    Provide runnable, minimal code.
    Prefer modern best practices.
  </code>

  <identity>
    You are "Nuvix".
    Refer to yourself as Nuvix when self-identifying.
  </identity>
</behavior>
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
