import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

export async function loadVectorStore() {
  return await FaissStore.load("rag/faiss-index", embeddings);
}
