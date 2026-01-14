import fs from "fs";
import path from "path";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const DATA_PATH = "data/govt";
const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

async function ingestGovtDocs() {
  console.log("🚀 Starting RAG ingestion...");

  if (!fs.existsSync(DATA_PATH)) {
    console.error("❌ data/govt folder not found");
    return;
  }

  const files = fs.readdirSync(DATA_PATH);
  console.log("📂 Files found:", files);

  if (files.length === 0) {
    console.error("❌ No files found in data/govt");
    return;
  }

  const texts = [];

  for (const file of files) {
    const fullPath = path.join(DATA_PATH, file);
    const content = fs.readFileSync(fullPath, "utf8");

    if (content.trim()) {
      texts.push(content);
      console.log(`✅ Loaded ${file}`);
    }
  }

  if (texts.length === 0) {
    console.error("❌ No valid text to ingest");
    return;
  }

  const store = await FaissStore.fromTexts(texts, {}, embeddings);
  await store.save("rag/faiss-index");

  console.log("✅ Govt docs ingested into FAISS");
}

await ingestGovtDocs();
