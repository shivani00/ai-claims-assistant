import { useState } from "react";
import MessageBubble from "./MessageBubble";
import UploadPanel from "./UploadPanel";
import ClaimProgress from "./ClaimProgress";
import { sendMessage } from "../api/chat";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [claimId, setClaimId] = useState(null);
  const [files, setFiles] = useState([]);

  async function handleSend() {
    if (!input && files.length === 0) return;

    setMessages(m => [...m, { role: "user", text: input || "Uploaded files" }]);

    const res = await sendMessage({ message: input, claimId, files });

    if (res.claimId) setClaimId(res.claimId);

    setMessages(m => [
      ...m,
      { role: "assistant", text: res.response?.message || "Processing..." }
    ]);

    setInput("");
    setFiles([]);
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-soft p-6 rounded-xl shadow-md">
      <ClaimProgress />

      <div className="h-[400px] overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <UploadPanel onUpload={setFiles} />
        <input
          className="flex-1 px-4 py-2 rounded-lg border"
          placeholder="Describe what happened..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
