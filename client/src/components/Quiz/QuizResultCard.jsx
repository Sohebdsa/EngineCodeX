import useQuizStore from '../../stores/useQuizStore';

function ScoreRing({ score, size = 96 }) {
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#3fb950' : score >= 40 ? '#d29922' : '#f85149';
  return (
    <svg width={size} height={size} viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--color-surface-3)" strokeWidth="6" />
      <circle
        cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="48" y="54" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>
        {score}%
      </text>
    </svg>
  );
}

function QuestionRow({ question, result, index }) {
  const correct = result?.correct;
  const score = result?.score ?? null;
  const statusColor = !result ? 'text-text-muted' : correct ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className={`quiz-result-row ${correct === true ? 'correct' : correct === false ? 'wrong' : ''}`}>
      <div className="quiz-result-row-num">{index + 1}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{question.title}</p>
        {result?.feedback && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{result.feedback}</p>
        )}
      </div>
      <div className={`text-xs font-bold shrink-0 ${statusColor}`}>
        {!result ? '—' : score !== null ? `${score}%` : correct ? '✓' : '✗'}
      </div>
    </div>
  );
}

export default function QuizResultCard({ stats, questions, results, onRetryWeak, onNewQuiz }) {
  const grade =
    stats.avgScore >= 90 ? { label: 'Excellent!', emoji: '🏆', color: 'text-emerald-400' }
    : stats.avgScore >= 70 ? { label: 'Good job!', emoji: '⭐', color: 'text-blue-400' }
    : stats.avgScore >= 50 ? { label: 'Keep practicing', emoji: '💪', color: 'text-amber-400' }
    : { label: 'Needs work', emoji: '📚', color: 'text-red-400' };

  const weakCount = questions.filter((q) => {
    const r = results[q.id];
    return !r || !r.correct || r.score < 70;
  }).length;

  return (
    <div className="quiz-result-card">
      {/* ── Score summary ── */}
      <div className="quiz-result-summary">
        <ScoreRing score={stats.avgScore} size={96} />
        <div>
          <p className={`text-2xl font-bold ${grade.color}`}>
            {grade.emoji} {grade.label}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {stats.correct} / {stats.total} correct &nbsp;·&nbsp; Avg score {stats.avgScore}%
          </p>
        </div>
      </div>

      {/* ── Per-question breakdown ── */}
      <div className="quiz-result-breakdown custom-scrollbar">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
          Question Breakdown
        </p>
        {questions.map((q, i) => (
          <QuestionRow key={q.id} question={q} result={results[q.id]} index={i} />
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="quiz-result-actions">
        {weakCount > 0 && (
          <button onClick={onRetryWeak} className="quiz-retry-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            Retry {weakCount} Weak Question{weakCount > 1 ? 's' : ''}
          </button>
        )}
        <button onClick={onNewQuiz} className="quiz-new-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          New Quiz
        </button>
      </div>
    </div>
  );
}
