import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getJobs = async (req, res, next) => {
  try {
    const { type, location, search, page = 1, limit = 200 } = req.query;
    
    const where = {
      applicationDeadline: {
        gte: new Date()
      }
    };
    
    if (type) where.jobType = type;
    if (location) where.location = { contains: location };
    if (search) where.title = { contains: search };
    
    const skip = (page - 1) * limit;
    
    const jobs = await prisma.job.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { postedAt: 'desc' }
    });
    
    const total = await prisma.job.count({ where });
    
    res.json({
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
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
