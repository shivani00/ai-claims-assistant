import fs from "fs";
import path from "path";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const DATA_ROOT = "data";
const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

function extractUserHint(filename) {
  // e.g. rahul_mehta_fir.txt → rahul_mehta
  return filename.split("_").slice(0, 2).join("_");
}

async function ingestAllDocs() {
  console.log("🚀 Starting RAG ingestion with metadata (folder + filename)...");

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

  const documents = [];

  for (const folder of folders) {
    const folderPath = path.join(DATA_ROOT, folder);
    const files = fs.readdirSync(folderPath);

    console.log(`📂 Scanning ${folder}/ (${files.length} files)`);

    for (const file of files) {
      const fullPath = path.join(folderPath, file);

      if (!fs.statSync(fullPath).isFile()) continue;

      const content = fs.readFileSync(fullPath, "utf8").trim();
      if (!content) continue;

      documents.push({
        pageContent: content,
        metadata: {
          source: folder,           // govt, hospital, policy, images, etc.
          filename: file,
          userHint: extractUserHint(file)
        }
      });

      console.log(`✅ Loaded ${folder}/${file}`);
    }
  }

  if (documents.length === 0) {
    console.error("❌ No valid documents found for ingestion");
    return;
  }

  console.log(`📊 Total documents loaded: ${documents.length}`);

  const store = await FaissStore.fromDocuments(documents, embeddings);
  await store.save("rag/faiss-index");

  console.log("✅ All documents ingested into FAISS with metadata");
}

await ingestAllDocs();
