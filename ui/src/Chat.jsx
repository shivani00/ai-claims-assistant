import { useState } from "react";
import { sendMessage } from "./api";
import "./chat.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [claimId, setClaimId] = useState(null);

  async function send() {
    if (!input.trim()) return;

    setMessages(m => [...m, { role: "user", text: input }]);

    const data = await sendMessage(claimId, input);
    setClaimId(data.claimId);

    setMessages(m => [
      ...m,
      { role: "bot", text: format(data.response) }
    ]);

    setInput("");
  }

  return (
    <div className="chat-container">
      <div className="chat-header">AI Claims Assistant</div>

      <div className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}

function format(res) {
  if (res.type === "STATUS") return res.message;
  if (res.type === "CONFIRM") return `${res.summary}\n${res.questions.join("\n")}`;
  if (res.type === "QUESTION") return res.questions.join("\n");
  if (res.type === "SUMMARY") return `${res.data.decision}\n${res.data.summary}`;
  return JSON.stringify(res, null, 2);
}
