import fs from "fs";
import path from "path";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const DATA_ROOT = "data";
const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

async function ingestAllDocs() {
  console.log("🚀 Starting RAG ingestion from all data folders...");

  if (!fs.existsSync(DATA_ROOT)) {
    console.error("❌ data folder not found");
    return;
  }

  const folders = fs
    .readdirSync(DATA_ROOT)
    .filter(f => fs.statSync(path.join(DATA_ROOT, f)).isDirectory());

  if (folders.length === 0) {
    console.error("❌ No subfolders found inside data/");
    return;
  }

  console.log("📁 Data folders found:", folders);

  const texts = [];

  for (const folder of folders) {
    const folderPath = path.join(DATA_ROOT, folder);
    const files = fs.readdirSync(folderPath);

    console.log(`📂 Scanning ${folder}/ (${files.length} files)`);

    for (const file of files) {
      const fullPath = path.join(folderPath, file);

      if (!fs.statSync(fullPath).isFile()) continue;

      const content = fs.readFileSync(fullPath, "utf8");

      if (content.trim()) {
        texts.push(content);
        console.log(`✅ Loaded ${folder}/${file}`);
      }
    }
  }

  if (texts.length === 0) {
    console.error("❌ No valid text found in data folders");
    return;
  }

  console.log(`📊 Total documents loaded: ${texts.length}`);

  const store = await FaissStore.fromTexts(texts, {}, embeddings);
  await store.save("rag/faiss-index");

  console.log("✅ All documents ingested into FAISS index");
}

await ingestAllDocs();
