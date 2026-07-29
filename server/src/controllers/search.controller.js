import prisma from '../config/database.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({ opportunities: [], jobs: [], courses: [], roadmaps: [], groups: [], mentors: [] });
    }

    const searchStr = q.toString();

    const [opportunities, jobs, courses, roadmaps, groups, mentors] = await Promise.all([
      prisma.opportunity.findMany({
        where: { title: { contains: searchStr } },
        take: 5
      }),
      prisma.job.findMany({
        where: { title: { contains: searchStr } },
        take: 5
      }),
      prisma.course.findMany({
        where: { title: { contains: searchStr } },
        take: 5
      }),
      prisma.learningRoadmap.findMany({
        where: { title: { contains: searchStr } },
        take: 5
      }),
      prisma.communityGroup.findMany({
        where: { name: { contains: searchStr } },
        take: 5
      }),
      prisma.mentor.findMany({
        where: {
          user: {
            OR: [
              { firstName: { contains: searchStr } },
              { lastName: { contains: searchStr } }
            ]
          }
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, profilePictureUrl: true } }
        },
        take: 5
      })
    ]);

    res.json({ opportunities, jobs, courses, roadmaps, groups, mentors });
  } catch (error) {
    next(error);
  }
};
