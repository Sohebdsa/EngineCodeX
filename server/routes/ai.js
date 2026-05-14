import express from 'express';

export const aiRouter = express.Router();

// ─── POST /chat ─────────────────────────────────────────────────
aiRouter.post('/chat', async (req, res) => {
  const { message, code, language, history, apiKey: clientApiKey, model: clientModel, provider, baseUrl } = req.body;

  const model = clientModel || 'gemini-2.0-flash';
  
  // Prefer client-provided key, fall back to env variable
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'No API key configured. Enter your API key in the navbar settings, or add an API KEY to server/.env',
    });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Build the system prompt
  const systemPrompt = `You are an expert DSA (Data Structures & Algorithms) coding assistant embedded in a code playground IDE. Your role:

1. Help users understand and solve DSA problems
2. Explain algorithms, time/space complexity
3. Debug code and find issues
4. Suggest optimizations
5. Provide clear, concise explanations with code examples

Guidelines:
- Keep responses focused and concise
- Use code blocks with language tags for code examples
- Always mention time and space complexity when relevant
- Be encouraging and educational
- If the user shares code, analyze it carefully before responding
- Format responses in Markdown`;

  // Build the current user message with code context
  let userMessage = message;
  if (code) {
    userMessage = `${message}\n\n--- Current Code (${language || 'javascript'}) ---\n\`\`\`${language || 'javascript'}\n${code}\n\`\`\``;
  }

  try {
    if (provider === 'custom') {
      // ─────────────────────────────────────────────────────────────
      // Custom OpenAI Compatible Provider
      // ─────────────────────────────────────────────────────────────
      // OpenRouter expects prefixes like 'google/gemma-4-31b-it'
      let finalModel = model;
      if (finalModel.startsWith('gemma') && !finalModel.includes('/')) {
        finalModel = `google/${finalModel}`;
      }
      
      const endpoint = baseUrl || 'https://openrouter.ai/api/v1/chat/completions';
      const messages = [{ role: 'system', content: systemPrompt }];
      
      if (history && history.length > 0) {
        for (const msg of history) {
          messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
        }
      }
      messages.push({ role: 'user', content: userMessage });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: finalModel,
          messages: messages,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || `Custom API error: ${response.status} ${response.statusText}`;
        return res.status(response.status).json({ error: errorMsg });
      }

      const data = await response.json();
      const aiResponse = data?.choices?.[0]?.message?.content;

      if (!aiResponse) {
        return res.status(500).json({ error: 'No response generated from Custom API.' });
      }

      return res.json({ response: aiResponse });

    } else {
      // ─────────────────────────────────────────────────────────────
      // Default Google Gemini API
      // ─────────────────────────────────────────────────────────────
      const apiVersion = (model.includes('2.0') || model.includes('2.5') || model.startsWith('gemma')) ? 'v1alpha' : 'v1beta';
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;
      
      const contents = [];
      if (history && history.length > 0) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || `Gemini API error: ${response.status} ${response.statusText}`;
        return res.status(response.status).json({ error: errorMsg });
      }

      const data = await response.json();
      const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        return res.status(500).json({ error: 'No response generated. The model may have blocked the request.' });
      }

      return res.json({ response: aiResponse });
    }
  } catch (err) {
    console.error('AI Processing error:', err);
    res.status(500).json({ error: `Failed to reach API: ${err.message}` });
  }
});
