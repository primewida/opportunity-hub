import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const calculateJobProximityScore = (user, job) => {
  if (!job) return 0;
  
  const userState = (user?.currentState || user?.stateOfOrigin || user?.state || '').toLowerCase().trim();
  const jobLoc = (job.location || '').toLowerCase();
  const jobTitleDesc = `${job.title || ''} ${job.description || ''} ${job.location || ''}`.toLowerCase();

  // Tier 1: Exact State / City Match (Score: 1000)
  if (userState && userState.length > 2) {
    if (jobLoc.includes(userState) || jobTitleDesc.includes(userState)) {
      return 1000;
    }
  }

  // Tier 2: Nigeria (Nationwide / Other Nigerian States) (Score: 600)
  const isNigeria = jobLoc.includes('nigeria') ||
                    jobLoc.includes('lagos') ||
                    jobLoc.includes('abuja') ||
                    jobLoc.includes('port harcourt') ||
                    jobLoc.includes('ibadan') ||
                    jobLoc.includes('kano') ||
                    jobLoc.includes('enugu') ||
                    jobLoc.includes('kaduna') ||
                    jobLoc.includes('ogun') ||
                    jobLoc.includes('delta') ||
                    jobLoc.includes('edo') ||
                    jobLoc.includes('anambra') ||
                    jobLoc.includes('akwa ibom') ||
                    jobLoc.includes('cross river') ||
                    jobLoc.includes('plateau') ||
                    jobLoc.includes('kwara') ||
                    jobLoc.includes('osun') ||
                    jobLoc.includes('ondo') ||
                    jobLoc.includes('imo') ||
                    jobLoc.includes('abia') ||
                    jobLoc.includes('nationwide') ||
                    (job.salaryRange && job.salaryRange.includes('₦')) ||
                    (typeof job.tags === 'string' && job.tags.includes('Nigeria')) ||
                    (Array.isArray(job.tags) && job.tags.includes('Nigeria'));

  if (isNigeria) {
    return 600;
  }

  // Tier 3: Remote (Work From Anywhere) (Score: 300)
  if (jobLoc.includes('remote') || jobTitleDesc.includes('remote') || job.jobType === 'Remote') {
    return 300;
  }

  // Tier 4: International / Global (Score: 100)
  return 100;
};

export const getJobs = async (req, res, next) => {
  try {
    const { type, location, search, proximity, state: queryState, page = 1, limit = 200 } = req.query;
    const user = req.user || (queryState ? { currentState: queryState } : null);
    
    const where = {
      applicationDeadline: {
        gte: new Date()
      }
    };
    
    if (type && type !== 'All') where.jobType = type;
    if (location && location !== 'All') where.location = { contains: location };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    let jobs = await prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      take: 400
    });

    // Score proximity: State (1000) -> Nigeria (600) -> Remote (300) -> International (100)
    jobs = jobs.map(j => {
      const proximityScore = calculateJobProximityScore(user, j);
      return {
        ...j,
        proximityScore,
        isStateMatch: proximityScore >= 1000,
        isNigeriaMatch: proximityScore >= 600,
        isRemoteMatch: proximityScore === 300,
        isInternational: proximityScore <= 100
      };
    });

    // Sort strictly by proximity score DESC, then by date posted DESC
    jobs.sort((a, b) => {
      if (b.proximityScore !== a.proximityScore) {
        return b.proximityScore - a.proximityScore;
      }
      return new Date(b.postedAt || b.createdAt || 0) - new Date(a.postedAt || a.createdAt || 0);
    });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = jobs.slice(skip, skip + parseInt(limit));
    
    res.json({
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: jobs.length,
        totalPages: Math.ceil(jobs.length / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: { id }
    });
    
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.savedItem.create({
      data: {
        userId: req.user.id,
        itemType: 'Job',
        itemId: id
      }
    });
    res.json({ message: 'Job saved' });
  } catch (error) {
    next(error);
  }
};
