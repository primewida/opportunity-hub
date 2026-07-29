import { NotFoundError } from '../utils/errors.js';

export const generateCoverLetter = async (req, res, next) => {
  try {
    const { opportunityId, paragraphs, recipientName, recipientTitle } = req.body;
    const { opening, whyThisOpportunity, qualifications, contribution, closing } = paragraphs || {};

    const letter = {
      date: new Date().toISOString(),
      addressee: {
        name: recipientName,
        title: recipientTitle
      },
      paragraphs: {
        opening,
        whyThisOpportunity,
        qualifications,
        contribution,
        closing
      },
      signOff: 'Sincerely,\n[Your Name]'
    };

    res.json({
      message: 'Cover letter generated',
      letter
    });
  } catch (error) {
    next(error);
  }
};
