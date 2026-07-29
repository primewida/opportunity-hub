import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getTestTypes = async (req, res, next) => {
  try {
    const testTypes = await prisma.testType.findMany();
    res.json(testTypes);
  } catch (error) {
    next(error);
  }
};

export const getQuestions = async (req, res, next) => {
  try {
    const { testTypeId, subject } = req.query;
    
    if (!testTypeId) {
      return res.status(400).json({ error: 'testTypeId is required' });
    }

    const where = { testTypeId };
    if (subject) {
      where.subject = subject;
    }

    const questions = await prisma.testQuestion.findMany({
      where,
      select: {
        id: true,
        testTypeId: true,
        questionText: true,
        options: true,
        subject: true
        // Exclude correctAnswer and explanation
      }
    });

    res.json({
      count: questions.length,
      questions
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { testTypeId, answers } = req.body;
    
    if (!testTypeId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    let score = 0;
    const results = [];

    for (const ans of answers) {
      const { questionId, selectedAnswer } = ans;
      const question = await prisma.testQuestion.findUnique({ where: { id: questionId } });
      
      if (!question) continue;
      
      const isCorrect = selectedAnswer === question.correctAnswer;
      if (isCorrect) {
        score += 1;
      }
      
      results.push({
        questionId,
        correct: isCorrect,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      });
    }

    const total = results.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    res.json({
      score,
      total,
      percentage,
      results
    });
  } catch (error) {
    next(error);
  }
};
