import { useState, useEffect, useRef } from 'react';
import useQuizStore from '../../stores/useQuizStore';

// ─── Helpers ────────────────────────────────────────────────────────────────
function DiffBadge({ diff }) {
  const map = {
    easy:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/15  text-amber-400  border-amber-500/30',
    hard:   'bg-red-500/15    text-red-400    border-red-500/30',
  };
  return (
    <span className={`qm-badge ${map[diff] || map.medium}`}>
      {diff}
    </span>
  );
}
function TypeBadge({ type }) {
  return (
    <span className={`qm-badge ${type === 'mcq'
      ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
      : 'bg-blue-500/15   text-blue-400   border-blue-500/30'}`}>
      {type === 'mcq' ? 'Multiple Choice' : 'Code Question'}
    </span>
  );
}

function Spinner({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" style={{ color: '#10b981' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
        fill="none" strokeDasharray="31.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── MCQ option button ───────────────────────────────────────────────────────
function MCQOption({ label, text, selected, correct, wrong, onClick, disabled }) {
  let cls = 'qm-mcq-option';
  if (correct) cls += ' correct';
  else if (wrong) cls += ' wrong';
  else if (selected) cls += ' selected';
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      <span className="qm-mcq-label">{label}</span>
      <span className="qm-mcq-text">{text}</span>
      {correct && (
        <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {wrong && (
        <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      )}
    </button>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────
function LoadingSkeleton({ topic }) {
  return (
    <div className="qm-loading">
      <div className="qm-loading-icon">
        <Spinner size={36} />
      </div>
      <p className="qm-loading-title">Generating Questions</p>
      <p className="qm-loading-sub">
        Creating <strong>{topic}</strong> interview questions...
      </p>
      <div className="qm-skeleton-cards">
        {[1,2,3].map(i => (
          <div key={i} className="qm-skeleton-card" style={{ opacity: 1 - i * 0.2 }}>
            <div className="qm-skeleton-line long" />
            <div className="qm-skeleton-line short" />
            <div className="qm-skeleton-line medium" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty / search prompt ───────────────────────────────────────────────────
const SUGGESTIONS = [
  'Closures', 'Promises & async/await', 'The Event Loop', 'Prototypes & Inheritance',
  'Array methods', 'this keyword', 'Hoisting', 'Currying',
  'Debounce & Throttle', 'ES6 features', 'Generators', 'Error handling',
];

function SearchPrompt() {
  const topic = useQuizStore(s => s.topic);
  const count = useQuizStore(s => s.count);
  const questionType = useQuizStore(s => s.questionType);
  const difficulty = useQuizStore(s => s.difficulty);
  const setTopic = useQuizStore(s => s.setTopic);
  const setCount = useQuizStore(s => s.setCount);
  const setQuestionType = useQuizStore(s => s.setQuestionType);
  const setDifficulty = useQuizStore(s => s.setDifficulty);
  const generateQuestions = useQuizStore(s => s.generateQuestions);
  const generateError = useQuizStore(s => s.generateError);

  const [showSugg, setShowSugg] = useState(false);
  const [filtered, setFiltered] = useState(SUGGESTIONS);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleChange = (val) => {
    setTopic(val);
    setFiltered(val.trim()
      ? SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase()))
      : SUGGESTIONS);
  };

  const handleGenerate = (e) => {
    e?.preventDefault();
    setShowSugg(false);
    generateQuestions();
  };

  return (
    <div className="qm-search-prompt">
      <div className="qm-search-hero">
        <div className="qm-search-hero-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <h1 className="qm-search-title">JavaScript Interview Practice</h1>
        <p className="qm-search-sub">
          Enter a topic to generate AI-powered questions. Answer via MCQ or write real code — just like a real interview.
        </p>
      </div>

      {/* Search Bar */}
      <form className="qm-search-form" onSubmit={handleGenerate}>
        <div className="qm-search-wrap">
          <svg className="qm-search-icon" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={topic}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === 'Enter') handleGenerate();
              if (e.key === 'Escape') setShowSugg(false);
            }}
            onKeyUp={e => e.stopPropagation()}
            placeholder="Type a JS topic (e.g. Closures, Promises, Event Loop)..."
            className="qm-search-input"
            autoComplete="off"
          />
          <button type="submit" disabled={!topic.trim()} className="qm-search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Generate
          </button>

          {/* Suggestions */}
          {showSugg && filtered.length > 0 && (
            <div className="qm-suggestions">
              {filtered.slice(0, 7).map(s => (
                <button key={s} type="button" className="qm-suggestion-item"
                  onMouseDown={() => { setTopic(s); setShowSugg(false); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" className="opacity-40">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Config row */}
      <div className="qm-config-row">
        <div className="qm-config-group">
          <label className="qm-config-label">Questions</label>
          <select value={count} onChange={e => setCount(Number(e.target.value))} className="qm-config-select">
            {[3,5,7,10].map(n => <option key={n} value={n}>{n} questions</option>)}
          </select>
        </div>
        <div className="qm-config-group">
          <label className="qm-config-label">Format</label>
          <select value={questionType} onChange={e => setQuestionType(e.target.value)} className="qm-config-select">
            <option value="mixed">Mixed (MCQ + Code)</option>
            <option value="mcq">MCQ Only</option>
            <option value="code">Code Only</option>
          </select>
        </div>
        <div className="qm-config-group">
          <label className="qm-config-label">Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="qm-config-select">
            <option value="mixed">Mixed</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {generateError && (
        <div className="qm-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {generateError}
        </div>
      )}

      {/* Chip cloud */}
      <div className="qm-chip-cloud">
        <p className="qm-chip-label">Popular topics:</p>
        <div className="qm-chips">
          {['Closures', 'Promises', 'Event Loop', 'Array Methods', 'Prototypes', 'this keyword', 'Hoisting', 'Generators'].map(s => (
            <button key={s} className="qm-chip" onClick={() => setTopic(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Result block (inline answer feedback) ───────────────────────────────────
function ResultBlock({ result }) {
  if (!result) return null;
  return (
    <div className={`qm-result-block ${result.correct ? 'correct' : 'wrong'}`}>
      <div className="qm-result-header">
        <div className="flex items-center gap-2 font-semibold">
          {result.correct ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg> Correct!</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg> Incorrect</>
          )}
        </div>
        <div className="qm-score-pill">{result.score}%</div>
      </div>
      {result.feedback && <p className="qm-result-feedback">{result.feedback}</p>}
      {result.explanation && (
        <details className="qm-result-detail">
          <summary className="qm-result-detail-toggle">View full explanation</summary>
          <p className="qm-result-detail-body">{result.explanation}</p>
        </details>
      )}
    </div>
  );
}

// ─── Session complete screen ─────────────────────────────────────────────────
function SessionComplete({ stats, questions, results, onRetry, onNew }) {
  const grade =
    stats.avgScore >= 90 ? { label: 'Excellent!', emoji: '🏆', cls: 'text-emerald-400' }
    : stats.avgScore >= 70 ? { label: 'Great job!', emoji: '⭐', cls: 'text-blue-400' }
    : stats.avgScore >= 50 ? { label: 'Keep going!', emoji: '💪', cls: 'text-amber-400' }
    : { label: 'Needs work', emoji: '📚', cls: 'text-red-400' };

  const weakCount = questions.filter(q => {
    const r = results[q.id];
    return !r || !r.correct || r.score < 70;
  }).length;

  return (
    <div className="qm-complete">
      <div className="qm-complete-inner">
        {/* Score ring */}
        <div className="qm-big-ring">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="58" fill="none" stroke="var(--color-surface-3)" strokeWidth="10"/>
            <circle cx="70" cy="70" r="58" fill="none"
              stroke={stats.avgScore >= 70 ? '#3fb950' : stats.avgScore >= 40 ? '#d29922' : '#f85149'}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - stats.avgScore / 100)}`}
              strokeLinecap="round" transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
            <text x="70" y="62" textAnchor="middle" fontSize="28" fontWeight="800"
              fill={stats.avgScore >= 70 ? '#3fb950' : stats.avgScore >= 40 ? '#d29922' : '#f85149'}>
              {stats.avgScore}%
            </text>
            <text x="70" y="84" textAnchor="middle" fontSize="12" fill="var(--color-text-muted)">
              avg score
            </text>
          </svg>
        </div>
        <p className={`qm-grade ${grade.cls}`}>{grade.emoji} {grade.label}</p>
        <p className="qm-grade-sub">
          {stats.correct} / {stats.total} correct
        </p>

        {/* Breakdown */}
        <div className="qm-breakdown">
          {questions.map((q, i) => {
            const r = results[q.id];
            return (
              <div key={q.id} className={`qm-breakdown-row ${r?.correct ? 'correct' : r ? 'wrong' : ''}`}>
                <span className="qm-breakdown-num">{i + 1}</span>
                <span className="qm-breakdown-title">{q.title}</span>
                <span className="qm-breakdown-score">
                  {r ? `${r.score}%` : '—'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          {weakCount > 0 && (
            <button onClick={onRetry} className="qm-retry-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
              </svg>
              Retry {weakCount} weak
            </button>
          )}
          <button onClick={onNew} className="qm-new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main QuizMain component ─────────────────────────────────────────────────
export default function QuizMain() {
  const topic        = useQuizStore(s => s.topic);
  const questions    = useQuizStore(s => s.questions);
  const currentIndex = useQuizStore(s => s.currentIndex);
  const answers      = useQuizStore(s => s.answers);
  const results      = useQuizStore(s => s.results);
  const sessionComplete = useQuizStore(s => s.sessionComplete);
  const isGenerating = useQuizStore(s => s.isGenerating);
  const isVerifying  = useQuizStore(s => s.isVerifying);
  const verifyError  = useQuizStore(s => s.verifyError);
  const setAnswer    = useQuizStore(s => s.setAnswer);
  const verifyAnswer = useQuizStore(s => s.verifyAnswer);
  const nextQuestion = useQuizStore(s => s.nextQuestion);
  const prevQuestion = useQuizStore(s => s.prevQuestion);
  const goToQuestion = useQuizStore(s => s.goToQuestion);
  const retryWeak    = useQuizStore(s => s.retryWeak);
  const resetSession = useQuizStore(s => s.resetSession);
  const getSessionStats = useQuizStore(s => s.getSessionStats);

  const [showHint, setShowHint] = useState(false);
  useEffect(() => setShowHint(false), [currentIndex]);

  if (isGenerating) return <LoadingSkeleton topic={topic} />;
  if (questions.length === 0) return <SearchPrompt />;

  const stats = getSessionStats();

  if (sessionComplete) {
    return (
      <SessionComplete
        stats={stats}
        questions={questions}
        results={results}
        onRetry={retryWeak}
        onNew={resetSession}
      />
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;
  const result     = results[q.id];
  const isAnswered = !!result;
  const userAnswer = answers[q.id] || '';

  return (
    <div className="qm-root">
      {/* ── Progress bar ── */}
      <div className="qm-progress-bar-track">
        <div className="qm-progress-bar-fill"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}/>
      </div>

      <div className="qm-body">
        {/* ── Left: Question Panel ── */}
        <div className="qm-question-panel">
          {/* Question meta */}
          <div className="qm-q-meta">
            <span className="qm-q-counter">{currentIndex + 1} / {questions.length}</span>
            <div className="flex items-center gap-2">
              <DiffBadge diff={q.difficulty} />
              <TypeBadge type={q.type} />
            </div>
          </div>

          {/* Question title + description */}
          <h2 className="qm-q-title">{q.title}</h2>
          <p className="qm-q-desc">{q.description}</p>

          {/* Code snippet to analyze */}
          {q.code_snippet && (
            <div className="mt-5">
              <div className="qm-code-label">Reference Code</div>
              <pre className="qm-code-block"><code>{q.code_snippet}</code></pre>
            </div>
          )}

          {/* Hint */}
          {q.hint && (
            <div className="mt-4">
              <button className="qm-hint-btn" onClick={() => setShowHint(h => !h)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>
              {showHint && <div className="qm-hint-box">💡 {q.hint}</div>}
            </div>
          )}

          {/* Navigation dots */}
          <div className="qm-dots">
            {questions.map((qd, i) => {
              const r = results[qd.id];
              let cls = 'qm-dot';
              if (i === currentIndex) cls += ' active';
              else if (r?.correct) cls += ' correct';
              else if (r && !r.correct) cls += ' wrong';
              return (
                <button key={i} className={cls} onClick={() => goToQuestion(i)} title={`Q${i+1}`}/>
              );
            })}
          </div>
        </div>

        {/* ── Right: Answer Panel ── */}
        <div className="qm-answer-panel">
          <div className="qm-answer-header">
            {q.type === 'mcq' ? 'Choose your answer' : 'Write your answer'}
          </div>

          {/* MCQ */}
          {q.type === 'mcq' && (
            <div className="qm-mcq-grid">
              {q.options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx);
                const selected = userAnswer === opt;
                const isCorrect = isAnswered && q.correct_answer === opt;
                const isWrong   = isAnswered && selected && !isCorrect;
                return (
                  <MCQOption key={idx} label={label} text={opt}
                    selected={selected} correct={isCorrect} wrong={isWrong}
                    onClick={() => !isAnswered && setAnswer(q.id, opt)}
                    disabled={isAnswered} />
                );
              })}
            </div>
          )}

          {/* Code answer */}
          {q.type === 'code' && (
            <textarea
              className="qm-code-answer"
              value={userAnswer}
              onChange={e => setAnswer(q.id, e.target.value)}
              disabled={isAnswered}
              placeholder="// Write your JavaScript answer here..."
              spellCheck={false}
              onKeyDown={e => e.stopPropagation()}
              onKeyUp={e => e.stopPropagation()}
            />
          )}

          {/* Result inline */}
          <ResultBlock result={result} />

          {verifyError && !isAnswered && (
            <div className="qm-error mt-3">{verifyError}</div>
          )}

          {/* Action buttons */}
          <div className="qm-action-row">
            <button className="qm-nav-btn" onClick={prevQuestion} disabled={currentIndex === 0}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Prev
            </button>

            {!isAnswered ? (
              <button
                className="qm-submit-btn"
                onClick={verifyAnswer}
                disabled={isVerifying || !userAnswer.trim()}
              >
                {isVerifying ? (
                  <><Spinner size={14}/> Checking...</>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Submit Answer
                  </>
                )}
              </button>
            ) : currentIndex < questions.length - 1 ? (
              <button className="qm-next-btn" onClick={nextQuestion}>
                Next Question
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ) : (
              <button className="qm-next-btn"
                onClick={() => useQuizStore.setState({ sessionComplete: true })}>
                View Results
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            )}

            <button className="qm-nav-btn" onClick={nextQuestion}
              disabled={currentIndex >= questions.length - 1}>
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
