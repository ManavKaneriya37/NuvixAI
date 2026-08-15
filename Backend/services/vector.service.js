const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const NuvixAI = pc.Index("nuvixai");

async function createMemory({ vectors, metadata, messageId }) {
  if (!Array.isArray(vectors) || vectors.length === 0) {
    throw new Error("Cannot create memory without a non-empty embedding vector.");
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

async function queryMemory({ queryVector, topK = 5, metadata }) {
  const data = await NuvixAI.query({
    vector: queryVector,
    topK,
    filter: metadata ? metadata : undefined,
    includeMetadata: true,
  });

  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory,
};
