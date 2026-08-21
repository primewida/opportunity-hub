import prisma from '../config/database.js';
import { calculateMatchPercentage } from '../services/match.service.js';
import { NotFoundError } from '../utils/errors.js';

export const getOpportunities = async (req, res, next) => {
  try {
    const { type, educationLevel, location, search, minMatch, deadlineBefore, page = 1, limit = 200 } = req.query;
    
    const where = {
      isActive: true,
      deadline: {
        gte: new Date()
      }
    };
    
    if (type) where.opportunityType = type;
    if (educationLevel) where.educationLevel = educationLevel;
    if (location) where.location = { contains: location };
    if (deadlineBefore) where.deadline = { ...where.deadline, lte: new Date(deadlineBefore) };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    let opportunities = await prisma.opportunity.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { postedAt: 'desc' }
    });
    
    const total = await prisma.opportunity.count({ where });
    
    if (req.user) {
      opportunities = opportunities.map(opp => {
        const { scorePercentage } = calculateMatchPercentage(req.user, opp);
        return { ...opp, matchPercentage: scorePercentage };
      });
      
      if (minMatch) {
        const minMatchNum = parseInt(minMatch);
        opportunities = opportunities.filter(opp => opp.matchPercentage >= minMatchNum);
      }
    }
    
    res.json({
      data: opportunities,
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

export const getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = req.user;
    
    const where = {
      isActive: true,
      deadline: {
        gte: new Date()
      }
    };
    
    let opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { postedAt: 'desc' }
    });
    
    opportunities = opportunities.map(opp => {
      const { scorePercentage } = calculateMatchPercentage(user, opp);
      return { ...opp, matchPercentage: scorePercentage };
    });
    
    opportunities.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    const skip = (page - 1) * limit;
    const paginatedOpportunities = opportunities.slice(skip, skip + parseInt(limit));
    const total = opportunities.length;
    
    res.json({
      data: paginatedOpportunities,
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

export const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id }
    });
    
    if (!opportunity) {
      throw new NotFoundError('Opportunity not found');
    }
    
    let result = { ...opportunity };
    
    if (req.user) {
      const match = calculateMatchPercentage(req.user, opportunity);
      result.matchPercentage = match.scorePercentage;
      
      result.matchReasons = [];
      if (match.matchDetails.educationMet) result.matchReasons.push({ met: true, text: 'Education level matches' });
      else result.matchReasons.push({ met: false, text: 'Education level might not match' });
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const saveOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.savedItem.create({
      data: {
        userId: req.user.id,
        itemType: 'Opportunity',
        itemId: id
      }
    });
    res.json({ message: 'Opportunity saved' });
  } catch (error) {
    next(error);
  }
};

export const unsaveOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.savedItem.deleteMany({
      where: {
        userId: req.user.id,
        itemType: 'Opportunity',
        itemId: id
      }
    });
    res.json({ message: 'Opportunity removed from saved' });
  } catch (error) {
    next(error);
  }
};

export const getSavedOpportunities = async (req, res, next) => {
  try {
    const savedItems = await prisma.savedItem.findMany({
      where: {
        userId: req.user.id,
        itemType: 'Opportunity'
      }
    });
    
    // savedItem uses generic itemType/itemId, fetch opportunities separately
    const itemIds = savedItems.map(item => item.itemId);
    const opportunities = await prisma.opportunity.findMany({
      where: {
        id: { in: itemIds }
      }
    });
    
    const results = opportunities.map(opp => {
      const savedItem = savedItems.find(item => item.itemId === opp.id);
      return { ...opp, savedAt: savedItem?.savedAt };
    });
    
    res.json({ data: results });
  } catch (error) {
    next(error);
  }
};

export const triggerScraper = async (req, res, next) => {
  try {
    const { scrapeLiveFeeds } = await import('../services/scraper.service.js');
    const results = await scrapeLiveFeeds();
    res.json({
      message: `Successfully synchronized ${results.length} live opportunities from web feeds`,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
