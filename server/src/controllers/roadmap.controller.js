import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getRoadmaps = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const roadmaps = await prisma.learningRoadmap.findMany({
      where: filter,
      include: {
        _count: {
          select: { steps: true }
        }
      }
    });

    let progressMap = {};
    if (req?.user) {
      const progresses = await prisma.userRoadmapProgress.findMany({
        where: { userId: req.user.id }
      });
      progresses.forEach(p => {
        progressMap[p.roadmapId] = p;
      });
    }

    const roadmapsWithProgress = roadmaps.map(roadmap => ({
      ...roadmap,
      progress: progressMap[roadmap.id] || null
    }));

    res.json(roadmapsWithProgress);
  } catch (error) {
    next(error);
  }
};

export const getRoadmapById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roadmap = await prisma.learningRoadmap.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });

    if (!roadmap) {
      throw new NotFoundError('Learning roadmap not found');
    }

    let progress = null;
    let stepCompletions = [];

    if (req?.user) {
      progress = await prisma.userRoadmapProgress.findUnique({
        where: { userId_roadmapId: { userId: req.user.id, roadmapId: id } }
      });
      const stepIds = roadmap.steps.map(s => s.id);
      stepCompletions = await prisma.userStepCompletion.findMany({
        where: { userId: req.user.id, stepId: { in: stepIds } }
      });
    }

    res.json({
      ...roadmap,
      progress,
      stepCompletions
    });
  } catch (error) {
    next(error);
  }
};

export const startRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const roadmap = await prisma.learningRoadmap.findUnique({
      where: { id }
    });

    if (!roadmap) {
      throw new NotFoundError('Learning roadmap not found');
    }

    const progress = await prisma.userRoadmapProgress.upsert({
      where: { userId_roadmapId: { userId, roadmapId: id } },
      update: {},
      create: {
        userId,
        roadmapId: id,
        status: 'In Progress',
        progress: 0,
        startedAt: new Date()
      }
    });

    await prisma.learningRoadmap.update({
      where: { id },
      data: { enrolledCount: { increment: 1 } }
    });

    res.status(201).json(progress);
  } catch (error) {
    next(error);
  }
};

export const completeStep = async (req, res, next) => {
  try {
    const { id: roadmapId, stepId } = req.params;
    const userId = req.user.id;

    const step = await prisma.roadmapStep.findFirst({
      where: { id: stepId, roadmapId }
    });

    if (!step) {
      throw new NotFoundError('Step not found in this roadmap');
    }

    // Create completion if not exists
    await prisma.userStepCompletion.upsert({
      where: { userId_stepId: { userId, stepId } },
      update: {},
      create: {
        userId,
        stepId,
        completedAt: new Date()
      }
    });

    // Recalculate progress
    const allSteps = await prisma.roadmapStep.findMany({
      where: { roadmapId }
    });
    
    const stepIds = allSteps.map(s => s.id);
    const completedCount = await prisma.userStepCompletion.count({
      where: { userId, stepId: { in: stepIds } }
    });

    const totalSteps = allSteps.length;
    const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
    const isCompleted = completedCount >= totalSteps;

    const progressRecord = await prisma.userRoadmapProgress.update({
      where: { userId_roadmapId: { userId, roadmapId } },
      data: {
        progress: progressPercent,
        status: isCompleted ? 'Completed' : 'In Progress',
        completedAt: isCompleted ? new Date() : null
      }
    });

    res.json(progressRecord);
  } catch (error) {
    next(error);
  }
};

export const getMyProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await prisma.userRoadmapProgress.findMany({
      where: { userId },
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            icon: true,
            estimatedWeeks: true
          }
        }
      }
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
};
