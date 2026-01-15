export default function MessageBubble({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-xl shadow-sm
        ${isUser ? "bg-primary text-white" : "bg-white text-gray-800"}`}
      >
        {text}
      </div>
    </div>
  );
}
