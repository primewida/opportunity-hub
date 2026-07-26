import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getCourses = async (req, res, next) => {
  try {
    const { skillCategory, isFree, search, sort, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (skillCategory) filter.skillCategory = skillCategory;
    if (isFree !== undefined) filter.isFree = isFree === 'true';
    if (search) {
      filter.title = { contains: search };
    }

    const orderBy = [];
    if (sort === 'ratingDesc') orderBy.push({ avgRating: 'desc' });
    if (sort === 'enrolledDesc') orderBy.push({ enrolledCount: 'desc' });
    if (orderBy.length === 0) orderBy.push({ title: 'asc' }); // default

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: filter,
        orderBy,
        skip,
        take
      }),
      prisma.course.count({ where: filter })
    ]);

    res.json({
      data: courses,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const getRecommendedCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true }
    });

    // Fetch top courses for recommendations based on basic criteria for now
    const courses = await prisma.course.findMany({
      orderBy: { avgRating: 'desc' },
      take: 5
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
};
