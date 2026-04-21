import express from 'express';

export const quizRouter = express.Router();

// ─── Utility: call LLM (supports Gemini + Custom OpenAI-compatible) ───────────
async function callLLM({ apiKey, model, provider, baseUrl, systemPrompt, userMessage }) {
  if (provider === 'custom') {
    let finalModel = model;
    if (finalModel.startsWith('gemma') && !finalModel.includes('/')) {
      finalModel = `google/${finalModel}`;
    }
    const endpoint = baseUrl || 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error: ${response.status}`);
    }
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  } else {
    // Default Gemini
    const apiVersion = model.startsWith('gemma') ? 'v1alpha' : 'v1beta';
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini API error: ${response.status}`);
    }
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

// ─── Extract JSON from LLM response (strip markdown fences if present) ────────
function extractJSON(text) {
  // Try to strip ```json ... ``` or ``` ... ``` fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1].trim() : text.trim();
  return JSON.parse(raw);
}

// ─── POST /api/quiz/generate ──────────────────────────────────────────────────
quizRouter.post('/generate', async (req, res) => {
  const {
    topic,
    count = 5,
    type = 'mixed', // 'mixed' | 'code' | 'mcq'
    difficulty = 'mixed', // 'mixed' | 'easy' | 'medium' | 'hard'
    apiKey: clientApiKey,
    model: clientModel,
    provider,
    baseUrl,
  } = req.body;

  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  const model = clientModel || 'gemini-2.0-flash';

  if (!apiKey) {
    return res.status(500).json({ error: 'No API key configured. Add one in Settings.' });
  }
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const typeInstruction =
    type === 'mcq'
      ? 'All questions must be MCQ (multiple choice).'
      : type === 'code'
      ? 'All questions must be code questions (no MCQ).'
      : 'Mix of MCQ and code questions (roughly half each).';

  const diffInstruction =
    difficulty === 'mixed'
      ? 'Mix of easy, medium, and hard difficulties.'
      : `All questions should be ${difficulty} difficulty.`;

  const systemPrompt = `You are an expert JavaScript interview question generator. 
You produce precise, educational, and varied interview questions.
Always respond with ONLY a valid JSON array — no explanation, no markdown outside the JSON block.`;

  const userMessage = `Generate exactly ${count} JavaScript interview questions about: "${topic}".

${typeInstruction}
${diffInstruction}

Return a JSON array where each element has this exact shape:
{
  "id": "q1",
  "type": "code" | "mcq",
  "difficulty": "easy" | "medium" | "hard",
  "title": "Short question title",
  "description": "Full question body — include all context needed to answer",
  "code_snippet": "optional starter code or code to analyze (empty string if none)",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correct_answer": "For MCQ: exact text of the correct option. For code: a concise model answer or expected output",
  "explanation": "Detailed explanation of why this is correct",
  "hint": "A helpful hint without giving away the answer"
}

Rules:
- For MCQ: options must be a 4-element array, correct_answer must match one of the options exactly.
- For code: options must be an empty array [].
- id must be unique: q1, q2, q3, ...
- Do NOT wrap in markdown. Return raw JSON array only.`;

  try {
    const raw = await callLLM({ apiKey, model, provider, baseUrl, systemPrompt, userMessage });
    let questions;
    try {
      questions = extractJSON(raw);
    } catch (parseErr) {
      console.error('JSON parse failed. Raw LLM output:\n', raw);
      return res.status(500).json({
        error: 'Failed to parse questions from AI response. Try again.',
        raw,
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ error: 'AI returned an unexpected format. Try again.' });
    }

    // Normalise fields so the frontend never crashes on missing keys
    const normalised = questions.map((q, i) => ({
      id: q.id || `q${i + 1}`,
      type: q.type === 'mcq' ? 'mcq' : 'code',
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      title: q.title || 'Question',
      description: q.description || '',
      code_snippet: q.code_snippet || '',
      options: Array.isArray(q.options) ? q.options : [],
      correct_answer: q.correct_answer || '',
      explanation: q.explanation || '',
      hint: q.hint || '',
    }));

    return res.json({ questions: normalised });
  } catch (err) {
    console.error('Quiz generate error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/quiz/verify ────────────────────────────────────────────────────
quizRouter.post('/verify', async (req, res) => {
  const {
    question,
    userAnswer,
    apiKey: clientApiKey,
    model: clientModel,
    provider,
    baseUrl,
  } = req.body;

  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  const model = clientModel || 'gemini-2.0-flash';

  if (!apiKey) {
    return res.status(500).json({ error: 'No API key configured.' });
  }
  if (!question || userAnswer === undefined) {
    return res.status(400).json({ error: 'question and userAnswer are required.' });
  }

  // Fast deterministic check for MCQ
  if (question.type === 'mcq') {
    const correct =
      userAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
    return res.json({
      correct,
      score: correct ? 100 : 0,
      feedback: correct
        ? '✅ Correct!'
        : `❌ Incorrect. The correct answer is: **${question.correct_answer}**`,
      explanation: question.explanation || '',
    });
  }

  // LLM-powered evaluation for code questions
  const systemPrompt = `You are a strict but fair JavaScript code evaluator for interview practice.
Evaluate the user's answer against the model answer and respond ONLY with a valid JSON object — no markdown.`;

  const userMessage = `Question: ${question.title}
  
Description: ${question.description}
${question.code_snippet ? `\nStarter/Reference Code:\n\`\`\`js\n${question.code_snippet}\n\`\`\`` : ''}

Model Answer: ${question.correct_answer}

User's Answer:
\`\`\`js
${userAnswer}
\`\`\`

Evaluate the user's answer. Return this exact JSON shape:
{
  "correct": true | false,
  "score": 0-100,
  "feedback": "1-2 sentence summary of correctness",
  "explanation": "Detailed explanation of what was right/wrong and the ideal solution"
}

Scoring guide:
- 90-100: Fully correct, optimal approach
- 70-89: Correct but not optimal or minor issues
- 40-69: Partially correct, core logic flawed
- 0-39: Mostly wrong

Return raw JSON only.`;

  try {
    const raw = await callLLM({ apiKey, model, provider, baseUrl, systemPrompt, userMessage });
    let result;
    try {
      result = extractJSON(raw);
    } catch {
      // Fallback: return a sensible error result
      return res.json({
        correct: false,
        score: 0,
        feedback: 'Could not evaluate your answer. Please try again.',
        explanation: raw,
      });
    }

    return res.json({
      correct: !!result.correct,
      score: typeof result.score === 'number' ? result.score : result.correct ? 100 : 0,
      feedback: result.feedback || '',
      explanation: result.explanation || '',
    });
  } catch (err) {
    console.error('Quiz verify error:', err);
    return res.status(500).json({ error: err.message });
  }
});
