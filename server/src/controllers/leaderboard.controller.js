import prisma from '../config/database.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const topStreaks = await prisma.streak.findMany({
      orderBy: {
        currentStreakCount: 'desc'
      },
      take: 20,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            institutionName: true
          }
        }
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userIds = topStreaks.map(s => s.userId);
    const recentLogs = await prisma.dailyStreakLog.findMany({
      where: {
        userId: { in: userIds },
        logDate: { gte: thirtyDaysAgo },
        goalMet: true
      }
    });

    const leaderboard = topStreaks.map((streak, index) => {
      const userLogs = recentLogs.filter(log => log.userId === streak.userId);
      const consistencyScore = (userLogs.length / 30) * 100;

      return {
        rank: index + 1,
        firstName: streak.user.firstName,
        lastName: streak.user.lastName,
        institutionName: streak.user.institutionName,
        currentStreakCount: streak.currentStreakCount,
        longestStreakCount: streak.longestStreakCount,
        consistencyScore: consistencyScore.toFixed(2)
      };
    });

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};
