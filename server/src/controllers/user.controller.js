import prisma from '../config/database.js';
import { getInitials } from '../utils/helpers.js';

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        userInterests: {
          include: { category: true }
        },
        userSkills: {
          include: { skill: true }
        }
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash, ...safeUser } = user;
    const formattedInterests = (safeUser.userInterests || []).map(ui => ui.category?.name).filter(Boolean);
    const formattedSkills = (safeUser.userSkills || []).map(us => ({
      id: us.skillId,
      name: us.skill?.name,
      proficiencyLevel: us.proficiencyLevel
    }));
    res.json({
      ...safeUser,
      interests: formattedInterests,
      skills: formattedSkills
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.dateOfBirth) {
      const parsedDate = new Date(data.dateOfBirth);
      if (!isNaN(parsedDate.getTime())) {
        data.dateOfBirth = parsedDate;
      } else {
        delete data.dateOfBirth;
      }
    }
    if (data.cgpa !== undefined && data.cgpa !== null && data.cgpa !== '') {
      data.cgpa = parseFloat(data.cgpa);
    }
    if (data.jambScore !== undefined && data.jambScore !== null && data.jambScore !== '') {
      data.jambScore = parseInt(data.jambScore);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data
    });
    const { passwordHash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        firstName: true,
        lastName: true,
        educationLevel: true,
        institutionName: true,
        bio: true,
        isMentor: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const initials = getInitials(user.firstName, user.lastName);
    res.json({ ...user, initials });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { onboardingCompleted: true }
    });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const profileSetup = async (req, res, next) => {
  try {
    const { firstName, lastName, educationLevel, institutionName, courseOfStudy, stateOfOrigin, interests, skills } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        educationLevel,
        institutionName,
        courseOfStudy,
        stateOfOrigin,
        onboardingCompleted: true
      }
    });

    if (skills && Array.isArray(skills)) {
      for (const s of skills) {
        const skill = await prisma.skill.upsert({
          where: { name: s.name },
          update: {},
          create: { name: s.name }
        });
        await prisma.userSkill.upsert({
          where: { userId_skillId: { userId: req.user.id, skillId: skill.id } },
          update: { proficiencyLevel: s.proficiencyLevel || 3 },
          create: { userId: req.user.id, skillId: skill.id, proficiencyLevel: s.proficiencyLevel || 3 }
        });
      }
    }

    if (interests && Array.isArray(interests)) {
      for (const intName of interests) {
        const cat = await prisma.category.upsert({
          where: { name: intName },
          update: {},
          create: { name: intName }
        });
        await prisma.userInterest.upsert({
          where: { userId_categoryId: { userId: req.user.id, categoryId: cat.id } },
          update: {},
          create: { userId: req.user.id, categoryId: cat.id }
        });
      }
    }

    const { passwordHash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const getUserSkills = async (req, res, next) => {
  try {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: req.user.id },
      include: { skill: true }
    });
    const formatted = userSkills.map(us => ({
      id: us.skillId,
      name: us.skill.name,
      proficiencyLevel: us.proficiencyLevel
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updateUserSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    await prisma.userSkill.deleteMany({ where: { userId: req.user.id } });
    
    if (skills && Array.isArray(skills)) {
      for (const s of skills) {
        const skill = await prisma.skill.upsert({
          where: { name: s.name },
          update: {},
          create: { name: s.name }
        });
        await prisma.userSkill.create({
          data: {
            userId: req.user.id,
            skillId: skill.id,
            proficiencyLevel: s.proficiencyLevel || 3
          }
        });
      }
    }

    const updated = await prisma.userSkill.findMany({
      where: { userId: req.user.id },
      include: { skill: true }
    });
    res.json(updated.map(us => ({ id: us.skillId, name: us.skill.name, proficiencyLevel: us.proficiencyLevel })));
  } catch (error) {
    next(error);
  }
};

export const getUserInterests = async (req, res, next) => {
  try {
    const userInterests = await prisma.userInterest.findMany({
      where: { userId: req.user.id },
      include: { category: true }
    });
    res.json(userInterests.map(ui => ui.category.name));
  } catch (error) {
    next(error);
  }
};

export const updateUserInterests = async (req, res, next) => {
  try {
    const { interests } = req.body;
    await prisma.userInterest.deleteMany({ where: { userId: req.user.id } });
    
    if (interests && Array.isArray(interests)) {
      for (const intName of interests) {
        const cat = await prisma.category.upsert({
          where: { name: intName },
          update: {},
          create: { name: intName }
        });
        await prisma.userInterest.create({
          data: {
            userId: req.user.id,
            categoryId: cat.id
          }
        });
      }
    }

    const updated = await prisma.userInterest.findMany({
      where: { userId: req.user.id },
      include: { category: true }
    });
    res.json(updated.map(ui => ui.category.name));
  } catch (error) {
    next(error);
  }
};
