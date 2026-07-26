import prisma from '../config/database.js';
import { getInitials } from '../utils/helpers.js';

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        interests: true,
        skills: true
      }
    });
    // Never expose passwordHash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body
    });
    res.json(updatedUser);
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
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const profileSetup = async (req, res, next) => {
  try {
    const { firstName, lastName, educationLevel, institutionName, courseOfStudy, stateOfOrigin, interests, skills } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        educationLevel,
        institutionName,
        courseOfStudy,
        stateOfOrigin,
        onboardingCompleted: true,
        ...(interests && {
          interests: {
            deleteMany: {},
            create: interests.map(name => ({ name }))
          }
        }),
        ...(skills && {
          skills: {
            deleteMany: {},
            create: skills.map(skill => ({ name: skill.name, proficiencyLevel: skill.proficiencyLevel }))
          }
        })
      },
      include: {
        interests: true,
        skills: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getUserSkills = async (req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id }
    });
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

export const updateUserSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    
    await prisma.$transaction([
      prisma.skill.deleteMany({ where: { userId: req.user.id } }),
      prisma.skill.createMany({
        data: skills.map(s => ({ ...s, userId: req.user.id }))
      })
    ]);

    const updatedSkills = await prisma.skill.findMany({ where: { userId: req.user.id } });
    res.json(updatedSkills);
  } catch (error) {
    next(error);
  }
};

export const getUserInterests = async (req, res, next) => {
  try {
    const interests = await prisma.interest.findMany({
      where: { userId: req.user.id }
    });
    res.json(interests);
  } catch (error) {
    next(error);
  }
};

export const updateUserInterests = async (req, res, next) => {
  try {
    const { interests } = req.body;
    
    await prisma.$transaction([
      prisma.interest.deleteMany({ where: { userId: req.user.id } }),
      prisma.interest.createMany({
        data: interests.map(name => ({ name, userId: req.user.id }))
      })
    ]);

    const updatedInterests = await prisma.interest.findMany({ where: { userId: req.user.id } });
    res.json(updatedInterests);
  } catch (error) {
    next(error);
  }
};
