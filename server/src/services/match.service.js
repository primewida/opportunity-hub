export const calculateMatchPercentage = (user, opportunity) => {
  let score = 0;
  const matchDetails = {
    educationMet: false,
    fieldOfStudyMet: false,
    cgpaMet: false,
    skillsMet: false,
    locationMet: false,
    interestsMet: false,
    nyscMet: false
  };

  if (!user || !opportunity) {
    return { scorePercentage: 0, matchDetails };
  }

  const eligibility = (() => {
    try {
      return typeof opportunity.eligibilityCriteria === 'string' 
        ? JSON.parse(opportunity.eligibilityCriteria) 
        : opportunity.eligibilityCriteria || {};
    } catch {
      return {};
    }
  })();

  const tags = (() => {
    try {
      return typeof opportunity.tags === 'string' 
        ? JSON.parse(opportunity.tags) 
        : opportunity.tags || [];
    } catch {
      return [];
    }
  })();

  // 1. Education match (25%)
  if (user.educationLevel && eligibility.education_level) {
    let requiredEdu = eligibility.education_level;
    if (!Array.isArray(requiredEdu)) {
      requiredEdu = [requiredEdu];
    }
    if (requiredEdu.includes(user.educationLevel)) {
      score += 25;
      matchDetails.educationMet = true;
    }
  } else if (!eligibility.education_level) {
    score += 25;
    matchDetails.educationMet = true;
  }

  // 2. Field of study match (20%)
  if (user.courseOfStudy && opportunity.fieldOfStudy) {
    if (user.courseOfStudy.toLowerCase().includes(opportunity.fieldOfStudy.toLowerCase())) {
      score += 20;
      matchDetails.fieldOfStudyMet = true;
    } else {
      score += 10; // partial match fallback
    }
  } else {
    score += 20;
    matchDetails.fieldOfStudyMet = true;
  }

  // 3. CGPA match (15%)
  if (eligibility.min_cgpa && user.cgpa) {
    const minCgpa = parseFloat(eligibility.min_cgpa);
    const userCgpa = parseFloat(user.cgpa);
    if (userCgpa >= minCgpa) {
      score += 15;
      matchDetails.cgpaMet = true;
    } else {
      score += Math.max(0, 15 * (userCgpa / minCgpa));
    }
  } else if (!eligibility.min_cgpa) {
    score += 15;
    matchDetails.cgpaMet = true;
  }

  // 4. Skills match (15%)
  let skillsScore = 15;
  matchDetails.skillsMet = true;
  score += skillsScore;

  // 5. Location match (10%)
  if (opportunity.location) {
    const loc = opportunity.location.toLowerCase();
    if (loc.includes('remote') || loc.includes('nigeria') || (user.currentState && loc.includes(user.currentState.toLowerCase()))) {
      score += 10;
      matchDetails.locationMet = true;
    }
  } else {
    score += 10;
    matchDetails.locationMet = true;
  }

  // 6. Interests match (10%)
  let interestsScore = 10;
  matchDetails.interestsMet = true;
  score += interestsScore;

  // 7. NYSC match (5%)
  score += 5;
  matchDetails.nyscMet = true;

  return {
    scorePercentage: Math.round(Math.min(100, Math.max(0, score))),
    matchDetails
  };
};
