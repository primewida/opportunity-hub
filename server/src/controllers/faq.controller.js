import prisma from '../config/database.js';

export const getFAQs = async (req, res, next) => {
  try {
    const { category } = req.query;

    const where = {};
    if (category) {
      where.category = category.toString();
    }

    const faqs = await prisma.faqItem.findMany({
      where,
      orderBy: { question: 'asc' }
    });

    res.json(faqs);
  } catch (error) {
    next(error);
  }
};
