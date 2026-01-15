import { useState } from "react";
import MessageBubble from "./MessageBubble";
import UploadPanel from "./UploadPanel";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input) return;

    setMessages(m => [
      ...m,
      { role: "user", text: input },
      { role: "assistant", text: "Analyzing your claim…" }
    ]);

    setInput("");
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-4 rounded shadow">
      <div className="h-64 overflow-y-auto mb-3">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} />
        ))}
      </div>

      <div className="flex gap-2">
        <UploadPanel onUpload={() => {}} />
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type here..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
