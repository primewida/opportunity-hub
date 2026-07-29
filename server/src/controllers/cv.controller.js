import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getTemplates = async (req, res, next) => {
  try {
    const templates = await prisma.cvTemplate.findMany();
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

export const generateCV = async (req, res, next) => {
  try {
    const { personalInfo, summary, education, experience, skills, references, templateId } = req.body;
    
    // For now, return the data as JSON formatted as a CV (PDF generation comes in Phase 8)
    res.json({
      message: 'CV generated',
      cvData: {
        personalInfo,
        summary,
        education,
        experience,
        skills,
        references,
        templateId
      }
    });
  } catch (error) {
    next(error);
  }
};
