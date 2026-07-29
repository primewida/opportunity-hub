import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Timer, ChevronLeft } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { interview } from '../services/api';
import './InterviewPrep.css';

export default function InterviewPrep() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    interview.getCategories()
      .then(data => {
        setCategories(data || []);
        setLoadingCategories(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingCategories(false);
      });
  }, []);

  const currentQuestion = questions[currentIndex];

  // Mock interview timer
  useEffect(() => {
    let interval;
    if (mockMode && timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [mockMode, timerActive, timeLeft]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMockMode(false);
    setTimerActive(false);
    setTimeLeft(120);
    setLoadingQuestions(true);
    interview.getQuestions(category.id)
      .then(data => {
        // Map API questionText to question expected by JSX
        const mappedQuestions = (data || []).map(q => ({
          ...q,
          question: q.questionText
        }));
        setQuestions(mappedQuestions);
        setLoadingQuestions(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingQuestions(false);
      });
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      if (mockMode) {
        setTimeLeft(120);
        setTimerActive(true);
      }
    }
  }, [currentIndex, mockMode]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      if (mockMode) {
        setTimeLeft(120);
        setTimerActive(true);
      }
    }
  }, [currentIndex, questions.length, mockMode]);

  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMockMode(false);
    setTimerActive(false);
    setTimeLeft(120);
  }, []);

  const toggleMockMode = useCallback(() => {
    setMockMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        setTimeLeft(120);
        setTimerActive(true);
      } else {
        setTimerActive(false);
        setTimeLeft(120);
      }
      return newMode;
    });
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerPercentage = (timeLeft / 120) * 100;

  // ─── Category Selection View ───
  if (!selectedCategory) {
    return (
      <div className="interview">
        <div className="interview__header">
          <h1 className="interview__title">🎤 Interview Prep</h1>
          <p className="interview__subtitle">
            Master your interview skills with flashcards and mock practice
          </p>
        </div>

        <div className="interview__categories">
          {loadingCategories ? <p>Loading categories...</p> : categories.map((cat) => (
            <Card
              key={cat.id}
              variant="interactive"
              onClick={() => handleCategorySelect(cat)}
            >
              <div className="interview__cat-card">
                <span className="interview__cat-icon">{cat.icon}</span>
                <h3 className="interview__cat-name">{cat.name}</h3>
                <Badge>{cat.questionCount} questions</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Flashcard View ───
  return (
    <div className="interview">
      <div className="interview__toolbar">
        <button className="interview__back-btn" onClick={handleBackToCategories}>
          <ChevronLeft size={20} />
          <span>Categories</span>
        </button>
        <span className="interview__counter">
          {currentIndex + 1} / {questions.length}
        </span>
        <button
          className={`interview__mock-toggle ${mockMode ? 'interview__mock-toggle--active' : ''}`}
          onClick={toggleMockMode}
        >
          <Timer size={16} />
          <span>Mock Interview</span>
        </button>
      </div>

      {loadingQuestions ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading questions...</div>
      ) : (
        <>
          {/* Timer bar */}
          {mockMode && (
        <div className="interview__timer-section">
          <div className="interview__timer-bar">
            <div
              className="interview__timer-fill"
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
            className={`interview__timer-text ${
              timeLeft <= 30 ? 'interview__timer-text--urgent' : ''
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {/* 3D Flashcard */}
      {currentQuestion && (
        <div className="interview__flashcard-wrapper" onClick={handleFlip}>
          <div
            className={`interview__flashcard ${
              isFlipped ? 'interview__card--flipped' : ''
            }`}
          >
            {/* Front - Question */}
            <div className="interview__card-front">
              <span className="interview__card-label">Question</span>
              <p className="interview__card-question">
                {currentQuestion.question}
              </p>
              <span className="interview__card-hint">Tap to reveal answer</span>
            </div>

            {/* Back - Answer */}
            <div className="interview__card-back">
              <div className="interview__answer-section">
                <h4 className="interview__answer-heading">💡 Tips</h4>
                <p className="interview__answer-text">{currentQuestion.tips}</p>
              </div>
              <div className="interview__answer-section">
                <h4 className="interview__answer-heading">✅ Sample Answer</h4>
                <p className="interview__answer-text">
                  {currentQuestion.sampleAnswer}
                </p>
              </div>
              <div className="interview__answer-section">
                <h4 className="interview__answer-heading">⚠️ Pitfalls</h4>
                <p className="interview__answer-text">
                  {currentQuestion.pitfalls}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="interview__controls">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={18} />
          <span>Prev</span>
        </Button>

        <Button variant="outline" onClick={handleFlip}>
          <RotateCcw size={18} />
          <span>Flip</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          <span>Next</span>
          <ArrowRight size={18} />
        </Button>
      </div>
        </>
      )}
    </div>
  );
}

