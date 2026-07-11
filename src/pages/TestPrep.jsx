import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Card, Button, Badge, MatchBadge, ProgressBar } from '../components/ui';
import { TEST_TYPES, QUIZ_QUESTIONS } from '../data/mockData';
import './TestPrep.css';

export default function TestPrep() {
  const [phase, setPhase] = useState('select'); // 'select' | 'quiz' | 'results'
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const questions = selectedTest
    ? QUIZ_QUESTIONS[selectedTest.id] || []
    : [];

  // Timer countdown
  useEffect(() => {
    let interval;
    if (phase === 'quiz' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  const handleStartQuiz = useCallback((test) => {
    setSelectedTest(test);
    setPhase('quiz');
    setCurrentQuestion(0);
    setAnswers({});
    const availableQuestions = QUIZ_QUESTIONS[test.id] || [];
    // Use the smaller of test timeLimit or proportional time based on available questions
    const totalMinutes = Math.min(
      test.timeLimit,
      Math.ceil((availableQuestions.length / test.questionCount) * test.timeLimit)
    );
    setTimeLeft(totalMinutes * 60);
  }, []);

  const handleSelectAnswer = useCallback((questionIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }, []);

  const handleSubmit = useCallback(() => {
    setPhase('results');
  }, []);

  const handleRetry = useCallback(() => {
    if (selectedTest) {
      handleStartQuiz(selectedTest);
    }
  }, [selectedTest, handleStartQuiz]);

  const handleBackToTests = useCallback(() => {
    setPhase('select');
    setSelectedTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(0);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate results
  const getResults = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  // ─── Test Selection ───
  if (phase === 'select') {
    return (
      <div className="test-prep">
        <div className="test-prep__header">
          <h1 className="test-prep__title">📝 Test Prep</h1>
          <p className="test-prep__subtitle">
            Practice with timed quizzes and track your progress
          </p>
        </div>

        <div className="test-prep__grid">
          {TEST_TYPES.map((test) => (
            <Card key={test.id} variant="elevated">
              <div className="test-prep__test-card">
                <span className="test-prep__test-icon">{test.icon}</span>
                <h3 className="test-prep__test-name">{test.name}</h3>
                <p className="test-prep__test-desc">{test.description}</p>
                <div className="test-prep__test-meta">
                  <Badge>{test.questionCount} Qs</Badge>
                  <Badge>
                    <Clock size={12} /> {test.timeLimit} min
                  </Badge>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartQuiz(test)}
                  disabled={!QUIZ_QUESTIONS[test.id]}
                >
                  {QUIZ_QUESTIONS[test.id] ? 'Start Quiz' : 'Coming Soon'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Quiz Mode ───
  if (phase === 'quiz') {
    const q = questions[currentQuestion];
    const totalTime = selectedTest
      ? Math.min(
          selectedTest.timeLimit,
          Math.ceil(
            (questions.length / selectedTest.questionCount) *
              selectedTest.timeLimit
          )
        ) * 60
      : 1;
    const timerPercentage = (timeLeft / totalTime) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="test-prep">
        {/* Timer bar */}
        <div className="test-prep__timer-section">
          <div className="test-prep__timer-bar">
            <div
              className="test-prep__timer-fill"
              style={{
                width: `${timerPercentage}%`,
                background:
                  timerPercentage > 50
                    ? 'var(--color-success)'
                    : timerPercentage > 20
                    ? 'var(--color-warning)'
                    : 'var(--color-error)',
              }}
            />
          </div>
          <span
            className={`test-prep__timer-text ${
              timeLeft <= 60 ? 'test-prep__timer-text--urgent' : ''
            }`}
          >
            <Clock size={16} />
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Question navigation dots */}
        <div className="test-prep__dots">
          {questions.map((_, idx) => (
            <button
              key={idx}
              className={`test-prep__dot ${
                idx === currentQuestion ? 'test-prep__dot--active' : ''
              } ${answers[idx] !== undefined ? 'test-prep__dot--answered' : ''}`}
              onClick={() => setCurrentQuestion(idx)}
              aria-label={`Question ${idx + 1}`}
            />
          ))}
        </div>

        {/* Question */}
        {q && (
          <div className="test-prep__question-area">
            <span className="test-prep__q-counter">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <h2 className="test-prep__q-text">{q.question}</h2>

            <div className="test-prep__options">
              {q.options.map((option, optIdx) => (
                <button
                  key={optIdx}
                  className={`test-prep__option ${
                    answers[currentQuestion] === optIdx
                      ? 'test-prep__option--selected'
                      : ''
                  }`}
                  onClick={() =>
                    handleSelectAnswer(currentQuestion, optIdx)
                  }
                >
                  <span className="test-prep__option-letter">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="test-prep__option-text">{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="test-prep__nav">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={18} /> Prev
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={() =>
                setCurrentQuestion((p) =>
                  Math.min(questions.length - 1, p + 1)
                )
              }
            >
              Next <ChevronRight size={18} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              Submit ({answeredCount}/{questions.length})
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ─── Results ───
  const results = getResults();

  return (
    <div className="test-prep">
      <div className="test-prep__results">
        <div className="test-prep__results-hero">
          <MatchBadge percentage={results.percentage} size="lg" />
          <h2 className="test-prep__results-title">
            {results.percentage >= 80
              ? '🎉 Excellent!'
              : results.percentage >= 60
              ? '👍 Good Job!'
              : '💪 Keep Practicing!'}
          </h2>
          <p className="test-prep__results-score">
            You scored <strong>{results.correct}</strong> out of{' '}
            <strong>{results.total}</strong>
          </p>
        </div>

        <div className="test-prep__results-actions">
          <Button variant="primary" onClick={handleRetry}>
            <RotateCcw size={16} /> Retry
          </Button>
          <Button variant="outline" onClick={handleBackToTests}>
            All Tests
          </Button>
        </div>

        {/* Question Review */}
        <h3 className="test-prep__review-title">Question Review</h3>
        <div className="test-prep__review">
          {questions.map((q, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={q.id}
                className={`test-prep__review-card ${
                  isCorrect
                    ? 'test-prep__review-card--correct'
                    : 'test-prep__review-card--wrong'
                }`}
              >
                <div className="test-prep__review-header">
                  {isCorrect ? (
                    <CheckCircle size={20} className="test-prep__icon--correct" />
                  ) : (
                    <XCircle size={20} className="test-prep__icon--wrong" />
                  )}
                  <span className="test-prep__review-qnum">Q{idx + 1}</span>
                </div>
                <p className="test-prep__review-question">{q.question}</p>
                <div className="test-prep__review-answers">
                  <span className="test-prep__review-answer test-prep__review-answer--correct">
                    ✅ {q.options[q.correctAnswer]}
                  </span>
                  {!isCorrect && userAnswer !== undefined && (
                    <span className="test-prep__review-answer test-prep__review-answer--wrong">
                      ❌ {q.options[userAnswer]}
                    </span>
                  )}
                  {userAnswer === undefined && (
                    <span className="test-prep__review-answer test-prep__review-answer--skipped">
                      ⏭ Skipped
                    </span>
                  )}
                </div>
                <p className="test-prep__review-explanation">
                  💡 {q.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
