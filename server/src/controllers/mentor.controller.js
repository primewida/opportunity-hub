import prisma from '../config/database.js';

export const getMentors = async (req, res, next) => {
  try {
    const { topics } = req.query;
    
    let whereClause = {};
    if (topics) {
      whereClause = {
        mentoringTopics: {
          contains: topics
        }
      };
    }

    const mentors = await prisma.mentor.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            educationLevel: true,
            institutionName: true
          }
        }
      }
    });
    res.json(mentors);
  } catch (error) {
    next(error);
  }
};

export const getMentorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await prisma.mentor.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (error) {
    next(error);
  }
};
