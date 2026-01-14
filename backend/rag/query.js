import { loadVectorStore } from "./vector-store.js";

export async function queryGovtData(query) {
  const store = await loadVectorStore();
  const results = await store.similaritySearch(query, 4);

  return results.map(r => r.pageContent);
}
