import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const applications = await prisma.userApplication.findMany({
      where: { userId },
      include: {
        opportunity: { select: { title: true, provider: true } },
        job: { select: { title: true, companyName: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const grouped = applications.reduce((acc, app) => {
      const status = app.applicationStatus || 'Saved';
      if (!acc[status]) acc[status] = [];
      acc[status].push(app);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { opportunityId, jobId, applicationStatus, notes } = req.body;

    const application = await prisma.userApplication.create({
      data: {
        userId,
        opportunityId,
        jobId,
        applicationStatus: applicationStatus || 'Saved',
        notes
      }
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { applicationStatus, appliedDate, followUpDate, notes } = req.body;

    const application = await prisma.userApplication.findFirst({
      where: { id, userId }
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const updatedApplication = await prisma.userApplication.update({
      where: { id },
      data: {
        applicationStatus,
        appliedDate: appliedDate ? new Date(appliedDate) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes
      }
    });

    res.json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await prisma.userApplication.findFirst({
      where: { id, userId }
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    await prisma.userApplication.delete({
      where: { id }
    });

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    next(error);
  }
};
