import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { filesRouter, seedWorkspace } from './routes/files.js';
import { aiRouter } from './routes/ai.js';
import { quizRouter } from './routes/quiz.js';

// Load .env file manually (no dotenv dependency needed in Node 20+)
import { readFileSync, existsSync } from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      process.env[key] = value;
    }
  }
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Mount routes
app.use('/api/files', filesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/quiz', quizRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Seed workspace with sample files on first boot
seedWorkspace();

app.listen(PORT, () => {
  console.log(`\n  🚀 DSA Playground Server running on http://localhost:${PORT}`);
  console.log(`  🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured ⚠️  (add GEMINI_API_KEY to server/.env)'}\n`);
});
