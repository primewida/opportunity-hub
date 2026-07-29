import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getStreak = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let streak = await prisma.streak.findUnique({
      where: { userId }
    });

    if (!streak) {
      streak = {
        currentStreakCount: 0,
        longestStreakCount: 0,
        goalHoursPerDay: 1,
        goalDaysOfWeek: '["Mon","Tue","Wed","Thu","Fri"]',
        lastGoalMetDate: null
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.dailyStreakLog.findMany({
      where: {
        userId,
        logDate: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        logDate: 'desc'
      },
      take: 30
    });

    res.json({ streak, logs });
  } catch (error) {
    next(error);
  }
};

export const updateGoals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { goalDaysOfWeek, goalHoursPerDay } = req.body;

    const streak = await prisma.streak.upsert({
      where: { userId },
      update: {
        goalDaysOfWeek: JSON.stringify(goalDaysOfWeek),
        goalHoursPerDay
      },
      create: {
        userId,
        goalDaysOfWeek: JSON.stringify(goalDaysOfWeek),
        goalHoursPerDay,
        currentStreakCount: 0,
        longestStreakCount: 0
      }
    });

    res.json({ streak });
  } catch (error) {
    next(error);
  }
};

export const logActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { hoursSpent } = req.body;

    const todayStr = new Date().toISOString().split('T')[0];
    const logDate = new Date(todayStr);

    let streak = await prisma.streak.findUnique({
      where: { userId }
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          goalHoursPerDay: 1,
          goalDaysOfWeek: '["Mon","Tue","Wed","Thu","Fri"]',
          currentStreakCount: 0,
          longestStreakCount: 0
        }
      });
    }

    const goalMet = hoursSpent >= streak.goalHoursPerDay;

    const log = await prisma.dailyStreakLog.upsert({
      where: {
        userId_logDate: {
          userId,
          logDate
        }
      },
      update: {
        hoursSpent,
        goalMet
      },
      create: {
        userId,
        logDate,
        hoursSpent,
        goalMet
      }
    });

    if (goalMet) {
      let yesterday = new Date(logDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayLog = await prisma.dailyStreakLog.findUnique({
        where: {
          userId_logDate: {
            userId,
            logDate: yesterday
          }
        }
      });

      const wasGoalMetYesterday = yesterdayLog && yesterdayLog.goalMet;
      
      let newCurrentStreakCount = streak.currentStreakCount;
      if (wasGoalMetYesterday || streak.currentStreakCount === 0 || !streak.lastGoalMetDate || streak.lastGoalMetDate < logDate) {
         if (!streak.lastGoalMetDate || streak.lastGoalMetDate.toISOString().split('T')[0] !== todayStr) {
             newCurrentStreakCount = streak.currentStreakCount + 1;
         }
      } else if (!wasGoalMetYesterday) {
         if (!streak.lastGoalMetDate || streak.lastGoalMetDate.toISOString().split('T')[0] !== todayStr) {
            newCurrentStreakCount = 1;
         }
      }
      
      const newLongestStreakCount = Math.max(streak.longestStreakCount, newCurrentStreakCount);
      
      streak = await prisma.streak.update({
        where: { userId },
        data: {
          currentStreakCount: newCurrentStreakCount,
          longestStreakCount: newLongestStreakCount,
          lastGoalMetDate: logDate
        }
      });
    }

    res.json({ log, streak });
  } catch (error) {
    next(error);
  }
};
