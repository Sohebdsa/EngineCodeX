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

// ── CORS Configuration ──
const allowedOrigins = [
  'http://enginecodex.s3-website.ap-south-1.amazonaws.com',
  'http://65.2.124.4',       // EC2 Nginx
  'http://localhost:5173',   // local dev
  'http://localhost:4173',   // vite preview
  'http://localhost:3000',   // local dev alt
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // allow listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // allow all Vercel preview/production deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

// Explicitly handle preflight for every route
app.options('*', cors());

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🚀 DSA Playground Server running on http://65.2.124.4:${PORT}`);
  console.log(`  🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured ⚠️  (add GEMINI_API_KEY to server/.env)'}\n`);
});
