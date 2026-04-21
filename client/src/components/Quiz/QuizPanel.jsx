import useQuizStore from '../../stores/useQuizStore';

// ─── Mini score ring ──────────────────────────────────────────────────────────
function ScoreRing({ score, size = 64 }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#3fb950' : score >= 40 ? '#d29922' : '#f85149';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth="5"/>
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 32 32)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}/>
      <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
        {score}%
      </text>
    </svg>
  );
}

export default function QuizPanel() {
  const questions    = useQuizStore(s => s.questions);
  const results      = useQuizStore(s => s.results);
  const currentIndex = useQuizStore(s => s.currentIndex);
  const goToQuestion = useQuizStore(s => s.goToQuestion);
  const sessionComplete = useQuizStore(s => s.sessionComplete);
  const isGenerating = useQuizStore(s => s.isGenerating);
  const topic        = useQuizStore(s => s.topic);
  const getSessionStats = useQuizStore(s => s.getSessionStats);
  const retryWeak    = useQuizStore(s => s.retryWeak);
  const resetSession = useQuizStore(s => s.resetSession);

  const stats = getSessionStats();

  const correct  = Object.values(results).filter(r => r.correct).length;
  const wrong    = Object.values(results).filter(r => !r.correct).length;
  const pending  = questions.length - Object.keys(results).length;

  return (
    <div className="qp-root">
      {/* Header */}
      <div className="qp-header">
        <div className="flex items-center gap-2">
          <div className="qp-header-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="qp-header-title">Score</span>
        </div>
        {topic && (
          <span className="qp-topic-badge">{topic}</span>
        )}
      </div>

      {/* Score display */}
      {questions.length > 0 && !isGenerating && (
        <>
          {/* Ring + counters */}
          <div className="qp-score-section">
            <ScoreRing score={stats.avgScore} size={72} />
            <div className="qp-counters">
              <div className="qp-counter correct">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="qp-counter-num">{correct}</span>
                <span className="qp-counter-label">Correct</span>
              </div>
              <div className="qp-counter wrong">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <span className="qp-counter-num">{wrong}</span>
                <span className="qp-counter-label">Wrong</span>
              </div>
              <div className="qp-counter pending">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="qp-counter-num">{pending}</span>
                <span className="qp-counter-label">Left</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="qp-progress-section">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              <span>Progress</span>
              <span>{stats.answered}/{stats.total}</span>
            </div>
            <div className="qp-prog-track">
              <div className="qp-prog-fill" style={{
                width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%`
              }}/>
            </div>
          </div>

          {/* Question list */}
          <div className="qp-q-list custom-scrollbar">
            <p className="qp-section-label">Questions</p>
            {questions.map((q, i) => {
              const r = results[q.id];
              const isCur = i === currentIndex;
              return (
                <button
                  key={q.id}
                  className={`qp-q-item ${isCur ? 'active' : ''} ${r?.correct ? 'correct' : r ? 'wrong' : ''}`}
                  onClick={() => goToQuestion(i)}
                >
                  <span className="qp-q-num">{i + 1}</span>
                  <span className="qp-q-title-sm">{q.title}</span>
                  {r ? (
                    r.correct ? (
                      <svg className="qp-q-status-icon correct-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg className="qp-q-status-icon wrong-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )
                  ) : (
                    <span className={`qp-q-dot ${isCur ? 'active-dot' : ''}`}/>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          {sessionComplete && (
            <div className="qp-actions">
              <button className="qp-retry-btn" onClick={retryWeak}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                </svg>
                Retry Weak
              </button>
              <button className="qp-new-btn" onClick={resetSession}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                New Quiz
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {questions.length === 0 && !isGenerating && (
        <div className="qp-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            Generate questions to see your score here
          </p>
        </div>
      )}

      {/* Generating state */}
      {isGenerating && (
        <div className="qp-empty">
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
              fill="none" strokeDasharray="31.4" strokeLinecap="round"/>
          </svg>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Generating...</p>
        </div>
      )}
    </div>
  );
}
