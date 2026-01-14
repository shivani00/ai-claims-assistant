export async function sendMessage(claimId, message) {
  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      claimId,
      userId: "john_doe",
      message
    })
  });

  return res.json();
}
