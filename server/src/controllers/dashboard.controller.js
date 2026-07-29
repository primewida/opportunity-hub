import prisma from '../config/database.js';
import { calculateMatchPercentage } from '../services/match.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        educationLevel: true,
        institutionName: true,
        profilePictureUrl: true,
        interests: true,
        skills: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [
      totalOpportunities,
      savedItems,
      applications,
      streak,
      opportunities,
      recentActivity
    ] = await Promise.all([
      prisma.opportunity.count({ where: { isActive: true } }),
      prisma.savedItem.count({ where: { userId } }),
      prisma.userApplication.count({ where: { userId } }),
      prisma.streak.findUnique({ where: { userId } }),
      prisma.opportunity.findMany({
        where: { isActive: true, deadline: { gte: new Date() } }
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Get upcoming deadlines from saved/applied opportunities
    const savedItemIds = await prisma.savedItem.findMany({
      where: { userId, itemType: 'Opportunity' },
      select: { itemId: true }
    });
    const appliedOppIds = await prisma.userApplication.findMany({
      where: { userId, opportunityId: { not: null } },
      select: { opportunityId: true }
    });
    const relevantIds = [
      ...savedItemIds.map(s => s.itemId),
      ...appliedOppIds.map(a => a.opportunityId)
    ].filter(Boolean);
    const upcomingDeadlines = relevantIds.length > 0
      ? await prisma.opportunity.findMany({
          where: { id: { in: relevantIds }, deadline: { gt: new Date() } },
          orderBy: { deadline: 'asc' },
          take: 5
        })
      : [];

    let matchedCount = 0;
    const scoredOpportunities = opportunities.map(opp => {
      const { scorePercentage } = calculateMatchPercentage(user, opp);
      if (scorePercentage >= 50) matchedCount++;
      return { ...opp, matchScore: scorePercentage };
    });

    const recommendation = scoredOpportunities
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    res.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        educationLevel: user.educationLevel,
        institutionName: user.institutionName,
        profilePictureUrl: user.profilePictureUrl
      },
      stats: {
        totalOpportunities,
        matchedOpportunities: matchedCount,
        savedItems,
        applications,
        streakDays: streak ? streak.currentStreakCount : 0
      },
      upcomingDeadlines,
      recentActivity,
      recommendation
    });
  } catch (error) {
    next(error);
  }
};
