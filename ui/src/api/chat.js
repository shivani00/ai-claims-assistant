import axios from "axios";

export async function sendMessage({ message, claimId, files }) {
  const formData = new FormData();
  if (message) formData.append("message", message);
  if (claimId) formData.append("claimId", claimId);
  formData.append("userId", "demo-user");

  files?.forEach(file => formData.append("files", file));

  const res = await axios.post("http://localhost:3000/chat", formData);
  return res.data;
}
