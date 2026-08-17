const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const NuvixAI = pc.Index("nuvixai");

async function createMemory({ vectors, messageId, metadata }) {
  if (!Array.isArray(vectors) || vectors.length === 0) {
    throw new Error(
      "Cannot create memory without a non-empty embedding vector.",
    );
  }

  await NuvixAI.upsert({
    records: [
      {
        id: String(messageId),
        values: vectors,
        metadata,
      },
    ],
  });
}

async function queryMemory({ queryVector, topK = 5, filter }) {
  const data = await NuvixAI.query({
    vector: queryVector,
    topK,
    // Pinecone filters address metadata fields directly, e.g.
    // { user: { $eq: "..." } }, rather than nesting them under `metadata`.
    filter,
    includeMetadata: true,
  });

  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory,
};
