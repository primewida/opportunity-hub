import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getSkills = async (req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

export const getSkillGap = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const userId = req.user.id;

    // Get opportunity required skills from tags
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId }
    });

    if (!opportunity) {
      throw new NotFoundError('Opportunity not found');
    }

    const requiredSkills = opportunity.tags || [];

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true }
    });

    const userSkillNames = userSkills.map(us => us.skill.name.toLowerCase());
    
    const gaps = requiredSkills.filter(reqSkill => 
      !userSkillNames.includes(reqSkill.toLowerCase())
    );

    const matchCount = requiredSkills.length - gaps.length;
    const readinessScore = requiredSkills.length > 0 
      ? Math.round((matchCount / requiredSkills.length) * 100) 
      : 100;

    res.json({
      userSkills: userSkills.map(us => ({ name: us.skill.name, level: us.proficiencyLevel })),
      requiredSkills,
      gaps,
      readinessScore
    });
  } catch (error) {
    next(error);
  }
};
