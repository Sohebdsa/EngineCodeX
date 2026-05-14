import { create } from 'zustand';
import { api } from '../utils/api';
import useAIStore from './useAIStore';
import useEditorStore from './useEditorStore';

export const QUIZ_TAB_ID = '__quiz__';
export const QUIZ_TAB_NAME = 'Interview Practice';

const useQuizStore = create((set, get) => ({
  // ─── Panel state (right-side score panel) ──────────────────────────
  isOpen: false,

  // ─── Session state ─────────────────────────────────────────────────
  topic: '',
  questions: [],
  currentIndex: 0,
  answers: {},       // { questionId: string }
  results: {},       // { questionId: { correct, score, feedback, explanation } }
  sessionComplete: false,

  // ─── Loading / error ───────────────────────────────────────────────
  isGenerating: false,
  isVerifying: false,
  generateError: null,
  verifyError: null,

  // ─── Config ────────────────────────────────────────────────────────
  count: 5,
  questionType: 'mixed',   // 'mixed' | 'code' | 'mcq'
  difficulty: 'mixed',

  // ─── Actions ───────────────────────────────────────────────────────
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  setTopic: (topic) => set({ topic }),
  setCount: (count) => set({ count }),
  setQuestionType: (questionType) => set({ questionType }),
  setDifficulty: (difficulty) => set({ difficulty }),

  setAnswer: (questionId, answer) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),

  goToQuestion: (index) => set({ currentIndex: index }),
  nextQuestion: () =>
    set((s) => ({
      currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
    })),
  prevQuestion: () =>
    set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),

  // Inject a quiz tab into the editor tab bar
  _openQuizTab: () => {
    const editorStore = useEditorStore.getState();
    const existing = editorStore.openTabs.find((t) => t.path === QUIZ_TAB_ID);
    if (!existing) {
      useEditorStore.setState((s) => ({
        openTabs: [
          ...s.openTabs,
          {
            path: QUIZ_TAB_ID,
            name: QUIZ_TAB_NAME,
            content: '',
            savedContent: '',
            language: 'plaintext',
            isDirty: false,
            isQuiz: true,
          },
        ],
        activeTab: QUIZ_TAB_ID,
      }));
    } else {
      useEditorStore.setState({ activeTab: QUIZ_TAB_ID });
    }
  },

  // Remove quiz tab from editor
  _closeQuizTab: () => {
    useEditorStore.setState((s) => {
      const newTabs = s.openTabs.filter((t) => t.path !== QUIZ_TAB_ID);
      const newActive =
        s.activeTab === QUIZ_TAB_ID
          ? newTabs[newTabs.length - 1]?.path || null
          : s.activeTab;
      return { openTabs: newTabs, activeTab: newActive };
    });
  },

  // Build request headers from AI store state
  _getApiPayload: () => {
    const aiState = useAIStore.getState();
    const modelKeys = aiState.apiKeys[aiState.model] || [];
    const apiKey = modelKeys[0] || '';
    return {
      apiKey,
      model: aiState.model,
      provider: aiState.apiProviders[aiState.model] || 'google',
      baseUrl: aiState.apiUrls[aiState.model] || '',
    };
  },

  generateQuestions: async () => {
    const { topic, count, questionType, difficulty, _getApiPayload, _openQuizTab } = get();
    if (!topic.trim()) return;

    set({
      isGenerating: true,
      generateError: null,
      questions: [],
      answers: {},
      results: {},
      currentIndex: 0,
      sessionComplete: false,
    });

    // Open the quiz tab immediately (shows loading state)
    _openQuizTab();
    // Open the right score panel too
    set({ isOpen: true });

    try {
      const payload = _getApiPayload();
      const data = await api.post('/api/quiz/generate', {
        topic,
        count,
        type: questionType,
        difficulty,
        ...payload,
      });
      set({ questions: data.questions, isGenerating: false });
    } catch (err) {
      set({ isGenerating: false, generateError: err.message });
    }
  },

  verifyAnswer: async () => {
    const { questions, currentIndex, answers, _getApiPayload } = get();
    const question = questions[currentIndex];
    if (!question) return;

    const userAnswer = answers[question.id] || '';
    if (!userAnswer.trim()) {
      set({ verifyError: 'Please provide an answer before submitting.' });
      return;
    }

    set({ isVerifying: true, verifyError: null });

    try {
      const payload = _getApiPayload();
      const data = await api.post('/api/quiz/verify', {
        question,
        userAnswer,
        ...payload,
      });

      set((s) => ({
        results: { ...s.results, [question.id]: data },
        isVerifying: false,
      }));

      // Auto-check if session is complete
      const { results, questions: qs } = get();
      if (Object.keys(results).length >= qs.length) {
        set({ sessionComplete: true });
      }
    } catch (err) {
      set({ isVerifying: false, verifyError: err.message });
    }
  },

  getSessionStats: () => {
    const { questions, results } = get();
    const total = questions.length;
    const answered = Object.keys(results).length;
    const correct = Object.values(results).filter((r) => r.correct).length;
    const avgScore =
      answered > 0
        ? Math.round(
            Object.values(results).reduce((sum, r) => sum + (r.score || 0), 0) / answered
          )
        : 0;
    return { total, answered, correct, avgScore };
  },

  retryWeak: () => {
    const { questions, results, _openQuizTab } = get();
    const weak = questions.filter((q) => {
      const r = results[q.id];
      return !r || !r.correct || r.score < 70;
    });
    if (weak.length === 0) return;
    set({
      questions: weak,
      answers: {},
      results: {},
      currentIndex: 0,
      sessionComplete: false,
    });
    _openQuizTab();
  },

  resetSession: () => {
    get()._closeQuizTab();
    set({
      topic: '',
      questions: [],
      answers: {},
      results: {},
      currentIndex: 0,
      sessionComplete: false,
      generateError: null,
      verifyError: null,
      isOpen: false,
    });
  },
}));

export default useQuizStore;
