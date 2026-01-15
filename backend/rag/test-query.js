import { queryRAG } from "./query.js";

const results = await queryRAG("John Doe accident FIR");
console.log(results);