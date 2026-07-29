import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.interviewCategory.findMany();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getQuestions = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    
    const where = {};
    if (categoryId) {
      where.categoryId = categoryId; // Note: Ensure Prisma schema uses String/Int as appropriate
    }
    
    const questions = await prisma.interviewQuestion.findMany({ where });
    res.json(questions);
  } catch (error) {
    next(error);
  }
};
