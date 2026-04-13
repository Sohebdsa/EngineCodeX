// test_gemma4.js
// Works with Node 18+ (native fetch). For Node <18, run: npm install node-fetch

const API_KEY = "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"; // paste your key from OpenRouter settings
const url = "https://openrouter.ai/api/v1/chat/completions";

(async () => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemma-4-31b-it",   // Gemma 4 31B Instruct model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello Gemma, please introduce yourself briefly." }
      ]
    })
  });

  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Gemma says:", data.choices[0].message.content);
})();
