import prisma from '../config/database.js';

export const getOnboardingStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        interests: true,
        skills: true,
        streak: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasProfile = !!user.firstName;
    const hasInterests = user.interests.length > 0;
    const hasSkills = user.skills.length > 0;
    const hasStreak = !!user.streak;

    let stepsCompleted = 0;
    if (hasProfile) stepsCompleted++;
    if (hasInterests) stepsCompleted++;
    if (hasSkills) stepsCompleted++;
    
    const totalSteps = 3; 
    const completionPercentage = Math.round((stepsCompleted / totalSteps) * 100);

    res.json({
      onboardingCompleted: user.onboardingCompleted,
      checklist: {
        hasProfile,
        hasInterests,
        hasSkills,
        hasStreak,
        completionPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true }
    });

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ message: 'Onboarding completed', user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      firstName, lastName, phoneNumber, dateOfBirth, gender,
      educationLevel, institutionName, courseOfStudy, stateOfOrigin,
      currentState, currentCity, jambScore, waecStatus, cgpa,
      nyscStatus, bio, careerGoals
    } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName, lastName, phoneNumber, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, gender,
        educationLevel, institutionName, courseOfStudy, stateOfOrigin,
        currentState, currentCity, jambScore: jambScore ? parseFloat(jambScore) : undefined, waecStatus, cgpa: cgpa ? parseFloat(cgpa) : undefined,
        nyscStatus, bio, careerGoals
      }
    });

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ message: 'Profile updated', user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

export const setInterests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ error: 'categoryIds must be an array' });
    }

    await prisma.userInterest.deleteMany({
      where: { userId }
    });

    if (categoryIds.length > 0) {
      await prisma.userInterest.createMany({
        data: categoryIds.map(categoryId => ({
          userId,
          categoryId
        }))
      });
    }

    res.json({ count: categoryIds.length });
  } catch (error) {
    next(error);
  }
};

export const setSkills = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: 'skills must be an array' });
    }

    await prisma.userSkill.deleteMany({
      where: { userId }
    });

    if (skills.length > 0) {
      await prisma.userSkill.createMany({
        data: skills.map(skill => ({
          userId,
          skillId: skill.skillId,
          proficiencyLevel: skill.proficiencyLevel || 'Beginner'
        }))
      });
    }

    res.json({ count: skills.length });
  } catch (error) {
    next(error);
  }
};
