const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

async function generateResponse(prompt, model = "qwen2.5:0.5b")  {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        num_predict: 200, 
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama a répondu avec le statut ${res.status}`);
  }

  const data = await res.json();
  return data.response;
}

module.exports = { generateResponse };