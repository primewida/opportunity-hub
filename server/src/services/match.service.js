/**
 * Profile-Centric AI Match & Recommendation Engine
 * Accurately scores opportunities against a student's real profile (Education, Field of Study, State, CGPA, Interests)
 */

function normalizeEdu(level = '') {
  const l = (level || '').toLowerCase().trim();
  if (l.includes('primary') || l.includes('basic') || l.includes('elementary')) return 'primary';
  if (l.includes('jss') || l.includes('junior secondary')) return 'jss';
  if (l.includes('sss') || l.includes('senior secondary') || l.includes('high school') || l.includes('waec') || l.includes('neco') || l.includes('secondary')) return 'sss';
  if (l.includes('phd') || l.includes('doctorate') || l.includes('postdoc')) return 'phd';
  if (l.includes('master') || l.includes('postgraduate') || l.includes('msc') || l.includes('mba')) return 'masters';
  if (l.includes('nysc') || l.includes('corps member')) return 'nysc';
  if (l.includes('graduate') || l.includes('alumni')) return 'graduate';
  if (l.includes('undergrad') || l.includes('bachelor') || l.includes('bsc') || l.includes('university') || l.includes('polytechnic') || l.includes('college')) return 'undergraduate';
  return 'undergraduate';
}

function getFieldKeywords(field = '') {
  const f = (field || '').toLowerCase();
  const clusters = {
    tech: ['computer', 'software', 'data', 'artificial intelligence', 'ai', 'cyber', 'tech', 'programming', 'developer', 'it', 'cloud', 'information technology', 'systems'],
    engineering: ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'petroleum', 'mechatronics', 'aerospace', 'robotics'],
    health: ['medicine', 'surgery', 'nursing', 'pharmacy', 'health', 'medical', 'biochemistry', 'biology', 'public health', 'dentistry', 'biomedical'],
    business: ['business', 'accounting', 'finance', 'economics', 'banking', 'management', 'marketing', 'commerce', 'entrepreneurship'],
    law_arts: ['law', 'legal', 'policy', 'political', 'arts', 'media', 'mass comm', 'journalism', 'design', 'creative', 'literature', 'humanities'],
    science: ['physics', 'chemistry', 'mathematics', 'statistics', 'geology', 'geosciences', 'science', 'environmental']
  };

  const matched = [];
  for (const [key, terms] of Object.entries(clusters)) {
    if (terms.some(t => f.includes(t))) {
      matched.push(key);
    }
  }
  return matched;
}

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
    return { scorePercentage: 60, matchDetails };
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

  const userEdu = normalizeEdu(user.educationLevel || user.education || 'undergraduate');
  const oppEdu = normalizeEdu(opportunity.educationLevel || (eligibility.education_level ? String(eligibility.education_level) : ''));
  const oppTitleDesc = `${opportunity.title || ''} ${opportunity.description || ''}`.toLowerCase();

  // 1. EDUCATION LEVEL MATCHING (35 Points)
  if (userEdu === 'primary') {
    if (oppEdu === 'primary' || oppTitleDesc.includes('primary') || oppTitleDesc.includes('kids') || oppTitleDesc.includes('junior')) {
      score += 35;
      matchDetails.educationMet = true;
    } else if (oppEdu === 'undergraduate' || oppEdu === 'masters' || oppEdu === 'phd') {
      score -= 50; // Heavy penalty: primary students shouldn't see university/phd grants
    } else {
      score += 15;
    }
  } else if (userEdu === 'jss' || userEdu === 'sss') {
    if (oppEdu === 'sss' || oppEdu === 'jss' || oppTitleDesc.includes('secondary') || oppTitleDesc.includes('high school') || oppTitleDesc.includes('waec') || oppTitleDesc.includes('neco')) {
      score += 35;
      matchDetails.educationMet = true;
    } else if (oppEdu === 'masters' || oppEdu === 'phd') {
      score -= 45;
    } else {
      score += 15;
    }
  } else if (userEdu === 'undergraduate') {
    if (oppEdu === 'undergraduate' || oppTitleDesc.includes('undergraduate') || oppTitleDesc.includes('university') || oppTitleDesc.includes('polytechnic') || oppTitleDesc.includes('bachelor')) {
      score += 35;
      matchDetails.educationMet = true;
    } else if (oppEdu === 'primary') {
      score -= 40;
    } else if (oppEdu === 'masters') {
      score += 12; // Prospective interest
    } else {
      score += 20;
    }
  } else if (userEdu === 'masters' || userEdu === 'phd') {
    if (oppEdu === 'masters' || oppEdu === 'phd' || oppTitleDesc.includes('postgraduate') || oppTitleDesc.includes('master') || oppTitleDesc.includes('phd') || oppTitleDesc.includes('fellowship')) {
      score += 35;
      matchDetails.educationMet = true;
    } else if (oppEdu === 'primary' || oppEdu === 'sss') {
      score -= 40;
    } else {
      score += 20;
    }
  } else if (userEdu === 'nysc' || userEdu === 'graduate') {
    if (oppEdu === 'nysc' || oppEdu === 'graduate' || oppTitleDesc.includes('nysc') || oppTitleDesc.includes('graduate') || oppTitleDesc.includes('job') || oppTitleDesc.includes('entry level')) {
      score += 35;
      matchDetails.educationMet = true;
      matchDetails.nyscMet = true;
    } else {
      score += 22;
    }
  }

  // 2. FIELD OF STUDY / COURSE MATCHING (25 Points)
  const userCourse = (user.courseOfStudy || user.course || '').toLowerCase().trim();
  const oppField = (opportunity.fieldOfStudy || '').toLowerCase().trim();
  
  if (userCourse) {
    const userClusters = getFieldKeywords(userCourse);
    const oppClusters = getFieldKeywords(`${oppField} ${oppTitleDesc}`);

    const hasClusterOverlap = userClusters.some(c => oppClusters.includes(c));
    const directCourseMatch = userCourse.length > 3 && (oppField.includes(userCourse) || oppTitleDesc.includes(userCourse));

    if (directCourseMatch) {
      score += 25;
      matchDetails.fieldOfStudyMet = true;
    } else if (hasClusterOverlap) {
      score += 22;
      matchDetails.fieldOfStudyMet = true;
    } else if (!oppField || oppField === 'general' || oppField.includes('all') || oppTitleDesc.includes('all disciplines') || oppTitleDesc.includes('any field')) {
      score += 15;
      matchDetails.fieldOfStudyMet = true;
    } else {
      score += 5; // Distinct discipline
    }
  } else {
    score += 15;
    matchDetails.fieldOfStudyMet = true;
  }

  // 3. USER INTERESTS & ASPIRATIONS (20 Points)
  const userInterests = Array.isArray(user.interests) 
    ? user.interests.map(i => (typeof i === 'string' ? i : i.name || '').toLowerCase())
    : [];

  if (userInterests.length > 0) {
    let matchedCount = 0;
    for (const interest of userInterests) {
      if (
        tags.some(t => String(t).toLowerCase().includes(interest)) ||
        oppTitleDesc.includes(interest) ||
        (oppField && oppField.includes(interest))
      ) {
        matchedCount++;
      }
    }

    if (matchedCount >= 3) {
      score += 20;
      matchDetails.interestsMet = true;
    } else if (matchedCount === 2) {
      score += 16;
      matchDetails.interestsMet = true;
    } else if (matchedCount === 1) {
      score += 12;
      matchDetails.interestsMet = true;
    } else {
      score += 4;
    }
  } else {
    score += 12;
    matchDetails.interestsMet = true;
  }

  // 4. LOCATION & STATE OF ORIGIN (10 Points)
  const userState = (user.stateOfOrigin || user.currentState || user.state || '').toLowerCase();
  const oppLoc = (opportunity.location || '').toLowerCase();

  if (oppLoc.includes('remote') || oppLoc.includes('global') || oppLoc.includes('nigeria') || oppLoc.includes('africa')) {
    score += 10;
    matchDetails.locationMet = true;
  } else if (userState && oppLoc.includes(userState)) {
    score += 10; // Exact state match (e.g. Lagos State scholarship for Lagos student)
    matchDetails.locationMet = true;
  } else {
    score += 5;
  }

  // 5. CGPA & ACADEMIC MERIT (10 Points)
  if (eligibility.min_cgpa && user.cgpa) {
    const minCgpa = parseFloat(eligibility.min_cgpa);
    const userCgpa = parseFloat(user.cgpa);
    if (userCgpa >= minCgpa) {
      score += 10;
      matchDetails.cgpaMet = true;
    } else {
      score += 2;
    }
  } else {
    score += 8;
    matchDetails.cgpaMet = true;
  }

  // 6. GENDER ELIGIBILITY CHECK
  const genderKeywords = {
    female: ['women in tech', 'women', 'female', 'girls', 'she code', 'girl child', 'women only'],
    male: ['men only', 'male only', 'boys only']
  };

  const isFemaleOnly = genderKeywords.female.some(kw => oppTitleDesc.includes(kw));
  const isMaleOnly = genderKeywords.male.some(kw => oppTitleDesc.includes(kw));

  if (user.gender) {
    const g = user.gender.toLowerCase();
    if (isFemaleOnly && g !== 'female') {
      score -= 50;
    } else if (isMaleOnly && g !== 'male') {
      score -= 50;
    }
  }

  // Scale between 40% and 98% for realistic matching scores
  const finalPercentage = Math.round(Math.min(98, Math.max(35, score)));

  return {
    scorePercentage: finalPercentage,
    matchDetails
  };
};
