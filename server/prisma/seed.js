/**
 * Seed script — populates the database with initial and production-grade data
 * Run: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Clean up variable tables to allow clean re-seeding ──
  try {
    await prisma.roadmapStep.deleteMany({});
    await prisma.learningRoadmap.deleteMany({});
    await prisma.opportunity.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.cvTemplate.deleteMany({});
    await prisma.faqItem.deleteMany({});
    await prisma.interviewQuestion.deleteMany({});
    await prisma.interviewCategory.deleteMany({});
    await prisma.testQuestion.deleteMany({});
    await prisma.testType.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.groupMember.deleteMany({});
    await prisma.communityGroup.deleteMany({});
  } catch (e) {
    console.log('  ⚠️ Note during pre-seed cleanup:', e.message);
  }

  // ── 1. Categories ──────────────────────────────────
  const categoryNames = [
    'Engineering', 'Medicine', 'Sciences', 'Arts', 'Social Sciences',
    'Law', 'Education', 'Business', 'IT/Computer Science', 'Agriculture',
    'Environmental Sciences', 'Pharmacy', 'Nursing', 'Architecture',
    'Mass Communication', 'Test Prep', 'Tech Skills', 'Scholarship Prep',
    'Soft Skills', 'Research', 'Leadership', 'Entrepreneurship',
  ];

  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✅ ${categoryNames.length} categories seeded`);

  // ── 2. Skills ──────────────────────────────────────
  const skillNames = [
    'Python Programming', 'JavaScript', 'React', 'Data Analysis',
    'Technical Writing', 'Communication', 'Leadership', 'Problem Solving',
    'Research', 'Project Management', 'Public Speaking', 'Critical Thinking',
    'Microsoft Office', 'SQL', 'Machine Learning', 'UI/UX Design',
    'Digital Marketing', 'Graphic Design', 'Content Writing', 'Financial Analysis',
    'Team Management', 'Negotiation', 'Networking', 'Time Management',
  ];

  for (const name of skillNames) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✅ ${skillNames.length} skills seeded`);

  // ── 3. Test User ───────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'student@opportunityhub.ng' },
    update: {
      passwordHash,
      onboardingCompleted: true,
    },
    create: {
      email: 'student@opportunityhub.ng',
      passwordHash,
      firstName: 'Adaeze',
      lastName: 'Okafor',
      gender: 'Female',
      educationLevel: 'Undergraduate',
      institutionName: 'University of Lagos',
      courseOfStudy: 'Computer Science',
      stateOfOrigin: 'Lagos',
      currentState: 'Lagos',
      currentCity: 'Yaba',
      cgpa: 4.2,
      jambScore: 310,
      waecStatus: 'Passed',
      nyscStatus: 'Not Applicable',
      bio: 'Passionate Computer Science undergraduate at UNILAG. Interested in AI, scholarships, and tech internships.',
      careerGoals: 'Become a Machine Learning Engineer and win international scholarships for graduate studies.',
      onboardingCompleted: true,
    },
  });
  console.log(`  ✅ Test user seeded: ${testUser.email}`);

  // ── 4. User Interests ──────────────────────────────
  const engineeringCat = await prisma.category.findUnique({ where: { name: 'IT/Computer Science' } });
  const techCat = await prisma.category.findUnique({ where: { name: 'Tech Skills' } });
  const scholarshipCat = await prisma.category.findUnique({ where: { name: 'Scholarship Prep' } });

  if (engineeringCat) {
    await prisma.userInterest.upsert({
      where: { userId_categoryId: { userId: testUser.id, categoryId: engineeringCat.id } },
      update: {},
      create: { userId: testUser.id, categoryId: engineeringCat.id },
    });
  }
  if (techCat) {
    await prisma.userInterest.upsert({
      where: { userId_categoryId: { userId: testUser.id, categoryId: techCat.id } },
      update: {},
      create: { userId: testUser.id, categoryId: techCat.id },
    });
  }
  if (scholarshipCat) {
    await prisma.userInterest.upsert({
      where: { userId_categoryId: { userId: testUser.id, categoryId: scholarshipCat.id } },
      update: {},
      create: { userId: testUser.id, categoryId: scholarshipCat.id },
    });
  }
  console.log('  ✅ User interests seeded');

  // ── 5. User Skills ─────────────────────────────────
  const userSkills = [
    { name: 'Python Programming', level: 4 },
    { name: 'React', level: 3 },
    { name: 'Data Analysis', level: 3 },
    { name: 'Communication', level: 4 },
    { name: 'Problem Solving', level: 5 },
    { name: 'Research', level: 3 },
  ];

  for (const s of userSkills) {
    const skill = await prisma.skill.findUnique({ where: { name: s.name } });
    if (skill) {
      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId: testUser.id, skillId: skill.id } },
        update: { proficiencyLevel: s.level },
        create: { userId: testUser.id, skillId: skill.id, proficiencyLevel: s.level },
      });
    }
  }
  console.log('  ✅ User skills seeded');

  // ── 6. Comprehensive Nigerian & Global Opportunities ────────────────────────
  const opportunities = [
    {
      title: 'NNPC/TotalEnergies National Merit Scholarship',
      description: 'Full scholarship for Nigerian undergraduates in STEM fields with excellent academic records enrolled in recognized Nigerian universities.',
      opportunityType: 'Scholarship',
      provider: 'NNPC / TotalEnergies EP Nigeria',
      sourceUrl: 'https://scholarships.totalenergies.com/ng',
      applicationLink: 'https://scholarships.totalenergies.com/ng/apply',
      deadline: new Date('2026-11-30'),
      location: 'Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate'], nationality: 'Nigerian', min_cgpa: 3.5, year_of_study: [1, 2] }),
      requiredDocuments: JSON.stringify(['JAMB Result Slip', 'University Admission Letter', 'WAEC/NECO Statement of Result', 'Recent Passport Photograph', 'Local Government ID Certificate']),
      applicationSteps: '1. Access TotalEnergies scholarship portal\n2. Create student account with matriculation details\n3. Upload academic records and certificates\n4. Take online aptitude assessment\n5. Final selection and award announcement',
      benefits: JSON.stringify(['Full Tuition Coverage', 'Annual Book & Research Allowance', '₦150,000 Annual Living Stipend', 'Mentorship from Energy Leaders']),
      tags: JSON.stringify(['Scholarship', 'STEM', 'Undergraduate', 'National Merit', 'Energy']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'Engineering',
      bannerColor: '#1565C0',
    },
    {
      title: 'MTN Foundation Scholarship Scheme (Science, Tech & Blind Students)',
      description: 'Annual scholarship initiative designed to recognize and reward top-performing undergraduate students in science, technology, and visually impaired scholars across Nigerian tertiary institutions.',
      opportunityType: 'Scholarship',
      provider: 'MTN Nigeria Foundation',
      sourceUrl: 'https://www.mtn.ng/foundation/scholarships/',
      applicationLink: 'https://www.mtn.ng/foundation/scholarships/',
      deadline: new Date('2026-10-31'),
      location: 'Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate'], nationality: 'Nigerian', min_cgpa: 3.5, year_of_study: [2, 3] }),
      requiredDocuments: JSON.stringify(['Recent Passport Photograph', 'Valid Student ID Card', 'Official CGPA Statement signed by HOD', 'Admission Letter', 'Birth Certificate or Age Declaration']),
      applicationSteps: '1. Visit official MTN Foundation portal\n2. Select your category (STEM or Blind Students)\n3. Complete personal & institutional verification\n4. Complete online CBT test\n5. Award ceremony in regional hubs',
      benefits: JSON.stringify(['₦300,000 Annual Cash Award till Graduation', 'Laptop for Top Scoring Finalists', 'Access to MTN Employability Workshop', 'Alumni Network Membership']),
      tags: JSON.stringify(['Scholarship', 'Undergraduate', 'Tech', 'STEM', 'MTN']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'IT/Computer Science',
      bannerColor: '#C28B00',
    },
    {
      title: 'Shell Nigeria University Scholarship Scheme (SPDC JV)',
      description: 'The SPDC JV University Scholarship scheme offers opportunities to ambitious Nigerian undergraduates in recognized federal and state universities.',
      opportunityType: 'Scholarship',
      provider: 'Shell Petroleum Development Company (SPDC)',
      sourceUrl: 'https://www.shell.com.ng/sustainability/communities/scholarship-scheme.html',
      applicationLink: 'https://www.shell.com.ng/sustainability/communities/scholarship-scheme.html',
      deadline: new Date('2026-11-15'),
      location: 'Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate'], nationality: 'Nigerian', min_cgpa: 3.5 }),
      requiredDocuments: JSON.stringify(['JAMB Admission Letter', 'WAEC Certificate with 5 Credits including Math and English', 'State of Origin Certificate', 'Letter of Identification from HOD']),
      applicationSteps: '1. Visit SPDC Scholarship web portal\n2. Select National Merit or Operational Area category\n3. Fill application form and attach verified documents\n4. Attend competitive CBT examination in Port Harcourt/Lagos/Abuja\n5. Award notification',
      benefits: JSON.stringify(['Comprehensive Annual Educational Grant', 'Priority Consideration for Industrial Training (IT/SIWES)', 'Shell Graduate Mentorship']),
      tags: JSON.stringify(['Scholarship', 'Engineering', 'Sciences', 'Undergraduate', 'Shell']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'Engineering',
      bannerColor: '#C62828',
    },
    {
      title: 'Agbami Medical & Engineering Professionals Scholarship',
      description: 'Funded by Star Deep Water Petroleum (Chevron & Famfa Oil) for outstanding undergraduates nationwide studying Medicine, Surgery, Dentistry, Pharmacy, and Engineering.',
      opportunityType: 'Scholarship',
      provider: 'Star Deep Water Petroleum (Chevron / Famfa)',
      sourceUrl: 'https://agbami.scholars.ng',
      applicationLink: 'https://agbami.scholars.ng',
      deadline: new Date('2026-12-15'),
      location: 'Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate'], nationality: 'Nigerian', year_of_study: [1, 2] }),
      requiredDocuments: JSON.stringify(['University Admission Letter', 'UTME Score Report', 'O Level Result Sheet', 'Local Government Identification Letter']),
      applicationSteps: '1. Register profile on Agbami scholarship portal\n2. Submit biodata and university matric details\n3. Take computer-based aptitude test\n4. Verification of original credentials\n5. Disbursement of grant to verified bank account',
      benefits: JSON.stringify(['₦200,000 for Engineering Students per session', '₦300,000 for Medical Students per session', 'Annual renewal upon maintaining minimum 3.0 CGPA']),
      tags: JSON.stringify(['Scholarship', 'Medicine', 'Engineering', 'Undergraduate', 'Chevron']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'Medicine',
      bannerColor: '#00695C',
    },
    {
      title: 'Google Africa Developer Scholarship (GADS)',
      description: 'Comprehensive program providing free developer training, Google Cloud & Android certification vouchers, and career placement mentorship across Africa.',
      opportunityType: 'Training Program',
      provider: 'Google & Andela',
      sourceUrl: 'https://gads.andela.com/',
      applicationLink: 'https://gads.andela.com/',
      deadline: new Date('2026-12-15'),
      location: 'Remote (Africa)',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate', 'Graduate', 'NYSC', 'SSS'], nationality: 'African' }),
      requiredDocuments: JSON.stringify([]),
      applicationSteps: '1. Submit quick registration on Pluralsight/Andela portal\n2. Complete initial skill assessment on chosen track (Cloud/Android/Web)\n3. Complete minimum learning hours and project submissions\n4. Qualify for Google Certified Associate Exam voucher',
      benefits: JSON.stringify(['100% Free Pluralsight Access', 'Google Professional Exam Voucher ($200 value)', '1-on-1 Mentorship from Senior Tech Leads', 'Job Readiness & Interview Prep Program']),
      tags: JSON.stringify(['Training Program', 'Tech', 'Cloud', 'Android', 'Google', 'Remote']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'IT/Computer Science',
      bannerColor: '#1976D2',
    },
    {
      title: 'ALX Africa Software Engineering & AI Fellowship',
      description: 'World-class 12-month intensive software engineering training program empowering young leaders across Africa with technical and professional skills.',
      opportunityType: 'Fellowship',
      provider: 'ALX Africa & The ROOM',
      sourceUrl: 'https://www.alxafrica.com/software-engineering/',
      applicationLink: 'https://www.alxafrica.com/software-engineering/',
      deadline: new Date('2026-10-25'),
      location: 'Lagos & Remote (Nigeria)',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate', 'Graduate', 'NYSC'], nationality: 'African', age_limit: '18-35' }),
      requiredDocuments: JSON.stringify(['Government Issued ID', 'Resume / CV']),
      applicationSteps: '1. Apply on ALX portal\n2. Complete cognitive, logic & English readiness test\n3. Onboarding into Founders & Engineers cohort\n4. Weekly milestones and peer projects',
      benefits: JSON.stringify(['Full Tuition Sponsorship via Mastercard Foundation', 'Access to ALX Hubs in Lagos & Abuja', 'Direct Connection to Global Job Network (The ROOM)', 'Globally Recognized Certificate']),
      tags: JSON.stringify(['Fellowship', 'Software Engineering', 'Fullstack', 'ALX', 'Career']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'IT/Computer Science',
      bannerColor: '#37474F',
    },
    {
      title: 'PTDF National & Overseas Scholarship Scheme',
      description: 'The Petroleum Technology Development Fund offers scholarships for MSc and PhD programs in high-demand oil, gas, renewable energy, and technology disciplines.',
      opportunityType: 'Scholarship',
      provider: 'Petroleum Technology Development Fund (PTDF)',
      sourceUrl: 'https://ptdf.gov.ng/scholarship/',
      applicationLink: 'https://ptdf.gov.ng/scholarship/',
      deadline: new Date('2026-12-30'),
      location: 'UK, Germany, France, Malaysia & Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Graduate', 'NYSC', 'Masters'], nationality: 'Nigerian', min_degree_class: 'Second Class Upper (2:1)' }),
      requiredDocuments: JSON.stringify(['First Degree Certificate', 'NYSC Discharge/Exemption Certificate', 'Official Transcript', 'Statement of Purpose / Research Proposal', 'Local Government Letter of Identification']),
      applicationSteps: '1. Register PIN and account on PTDF portal\n2. Upload academic transcripts and statement of purpose\n3. Attend physical interview with panel of professors\n4. Final merit list publication and placement abroad',
      benefits: JSON.stringify(['100% Tuition Fees Paid Directly to University', 'Monthly Living Allowance & Accommodation Subsidy', 'Return International Airfare', 'Book and Research Project Allowances']),
      tags: JSON.stringify(['Scholarship', 'Postgraduate', 'Overseas', 'Energy', 'Fully Funded', 'PTDF']),
      educationLevel: 'Masters',
      fieldOfStudy: 'Engineering',
      bannerColor: '#2E7D32',
    },
    {
      title: 'Chevening UK Government Scholarship 2027/2028',
      description: 'The UK government flagship international scholarship program, enabling outstanding emerging leaders from Nigeria to pursue a one-year master degree in any UK university.',
      opportunityType: 'Scholarship',
      provider: 'UK Foreign, Commonwealth & Development Office',
      sourceUrl: 'https://www.chevening.org/scholarships/',
      applicationLink: 'https://www.chevening.org/apply/',
      deadline: new Date('2026-11-05'),
      location: 'United Kingdom',
      eligibilityCriteria: JSON.stringify({ education_level: ['Graduate', 'NYSC'], nationality: 'Nigerian', work_experience_years: 2 }),
      requiredDocuments: JSON.stringify(['Degree Certificate', 'Academic Transcript', 'Two Reference Letters', 'Four 500-word Leadership & Career Essays', 'Valid International Passport']),
      applicationSteps: '1. Submit online application with four leadership essays\n2. Shortlisting for in-person interview at British High Commission Abuja/Lagos\n3. Secure unconditional offers from 3 eligible UK master programs\n4. Final award confirmation and visa processing',
      benefits: JSON.stringify(['Full Tuition Fee Coverage (including top UK institutions)', 'Monthly Living Stipend', 'Economy Class Return Travel to the UK', 'Arrival and Departure Allowances', 'Exclusive UK Networking Events']),
      tags: JSON.stringify(['Scholarship', 'Masters', 'UK', 'Fully Funded', 'Leadership', 'Global']),
      educationLevel: 'Masters',
      fieldOfStudy: null,
      bannerColor: '#283593',
    },
    {
      title: 'Mastercard Foundation Scholars Program',
      description: 'Comprehensive scholarship program developing transformative young leaders by providing access to world-class university education, transition-to-work support, and leadership development.',
      opportunityType: 'Scholarship',
      provider: 'Mastercard Foundation',
      sourceUrl: 'https://mastercardfdn.org/all/scholars/',
      applicationLink: 'https://mastercardfdn.org/all/scholars/becoming-a-scholar/',
      deadline: new Date('2027-02-28'),
      location: 'Global & African Partner Universities',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate', 'Graduate', 'SSS'], nationality: 'African', financial_need: true }),
      requiredDocuments: JSON.stringify(['High School / University Academic Transcripts', 'Proof of Financial Need / Family Background', 'Recommendation Letters', 'Personal Statement on Community Impact']),
      applicationSteps: '1. Select partner institution (e.g. Ashesi, ALU, KNUST, Edinburgh, Toronto)\n2. Apply for academic admission and Mastercard Foundation Scholarship simultaneously\n3. Institutional review and interview process\n4. Full scholarship award',
      benefits: JSON.stringify(['Full Tuition & Examination Fees', 'On-Campus Accommodation & Meals', 'Comprehensive Health Insurance', 'Laptop, Books & Learning Materials', 'Internship Placements & Career Coaching']),
      tags: JSON.stringify(['Scholarship', 'Fully Funded', 'Undergraduate', 'Masters', 'Leadership']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: null,
      bannerColor: '#D84315',
    },
    {
      title: 'She Code Africa Tech Bootcamp (Women in Tech)',
      description: 'An intensive, hands-on training program dedicated to elevating African women in software engineering, UI/UX design, cloud architecture, and data science.',
      opportunityType: 'Internship',
      provider: 'She Code Africa',
      sourceUrl: 'https://shecodeafrica.org/programs',
      applicationLink: 'https://shecodeafrica.org/academy',
      deadline: new Date('2026-10-10'),
      location: 'Lagos & Remote (Nigeria)',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate', 'Graduate', 'NYSC'], gender: 'Female', nationality: 'Nigerian' }),
      requiredDocuments: JSON.stringify(['Portfolio or GitHub Link (if any)', 'Short Video or Written Statement of Intent', 'Valid Student or National ID']),
      applicationSteps: '1. Complete online application on SCA portal\n2. Complete beginner aptitude & motivation questionnaire\n3. Attend virtual onboarding orientation\n4. 3-month intensive learning & real client capstone build',
      benefits: JSON.stringify(['Monthly Internet & Learning Stipend', 'Dedicated 1-on-1 Female Tech Mentor', 'Direct Placement into Partner Tech Startups', 'SCA Swag Box & Graduation Certificate']),
      tags: JSON.stringify(['Internship', 'Women', 'Tech', 'Frontend', 'Backend', 'Data']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'IT/Computer Science',
      bannerColor: '#AD1457',
    },
    {
      title: 'Federal Scholarship Board (FSB) Bilateral Education Agreement (BEA)',
      description: 'Federal Ministry of Education annual awards for undergraduate and postgraduate studies tenable in Russia, Morocco, Hungary, Egypt, China, and Romania.',
      opportunityType: 'Scholarship',
      provider: 'Federal Ministry of Education (Nigeria)',
      sourceUrl: 'https://education.gov.ng/federal-scholarship-board/',
      applicationLink: 'https://education.gov.ng/federal-scholarship-board/',
      deadline: new Date('2027-01-31'),
      location: 'International (Russia, Morocco, Hungary, etc.)',
      eligibilityCriteria: JSON.stringify({ education_level: ['SSS', 'Graduate', 'NYSC'], nationality: 'Nigerian', min_waec_grades: '5 Distinctions (A/B) in relevant subjects' }),
      requiredDocuments: JSON.stringify(['WAEC / NECO Senior School Certificate', 'National Population Commission Birth Certificate', 'State of Origin Identification Certificate', 'Medical Certificate of Fitness']),
      applicationSteps: '1. Register online on Federal Scholarship Board portal\n2. Print confirmation slip with tracking number\n3. Attend national CBT screening exam at designated zonal centers\n4. Zonal interview & country nomination',
      benefits: JSON.stringify(['Full Tuition Covered by Host Country', 'Monthly Supplementation Allowance from Nigerian Government', 'Warm Clothing and Health Insurance Grant', 'Free Medical Care in Host Country']),
      tags: JSON.stringify(['Scholarship', 'Government', 'International', 'Undergraduate', 'Postgraduate']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'Sciences',
      bannerColor: '#1B5E20',
    },
    {
      title: 'Jim Ovia Foundation Leaders Scholarship',
      description: 'In partnership with Africa-America Institute, this scholarship provides comprehensive higher education funding to African students with high leadership potential.',
      opportunityType: 'Scholarship',
      provider: 'Jim Ovia Foundation & AAI',
      sourceUrl: 'https://www.jimoviafoundation.org/leaders-scholarship',
      applicationLink: 'https://www.jimoviafoundation.org/leaders-scholarship',
      deadline: new Date('2026-11-20'),
      location: 'Nigeria & Partner African Institutions',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate'], nationality: 'African', min_cgpa: 3.5 }),
      requiredDocuments: JSON.stringify(['Official Academic Transcripts', 'Curriculum Vitae', 'Leadership Experience Essay', 'Two Letters of Recommendation']),
      applicationSteps: '1. Submit application via AAI scholarship portal\n2. Provide proof of admission to partner university\n3. Virtual interview with scholarship committee\n4. Final selection and orientation',
      benefits: JSON.stringify(['Full Tuition & Institutional Fees', 'Room and Board Stipend', 'Leadership & Ethics Masterclasses', 'Executive Mentorship by Business Leaders']),
      tags: JSON.stringify(['Scholarship', 'Undergraduate', 'Leadership', 'Business', 'STEM']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'Business',
      bannerColor: '#4E342E',
    },
    {
      title: 'Paystack Student Developer & Engineering Internship',
      description: 'A 6-month high-impact paid software engineering internship in Lagos/Remote, working directly on core payment APIs and developer tools used across Africa.',
      opportunityType: 'Internship',
      provider: 'Paystack (Stripe)',
      sourceUrl: 'https://paystack.com/careers',
      applicationLink: 'https://paystack.com/careers',
      deadline: new Date('2026-11-01'),
      location: 'Lagos & Remote (Nigeria)',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate', 'NYSC'], nationality: 'Nigerian' }),
      requiredDocuments: JSON.stringify(['Resume / CV', 'GitHub / Project Portfolio', 'Short write-up about a technical challenge solved']),
      applicationSteps: '1. Submit application online\n2. Take async coding assessment (TypeScript/Python/Go)\n3. Technical interview with senior engineer\n4. Culture conversation and offer',
      benefits: JSON.stringify(['Competitive ₦200,000+ Monthly Stipend', 'High-Spec MacBook Pro & Home Office Setup', 'Health Insurance & Free Lunch', 'Direct Path to Full-Time Graduate Offer']),
      tags: JSON.stringify(['Internship', 'Fintech', 'Software Engineering', 'React', 'Node.js']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'IT/Computer Science',
      bannerColor: '#007791',
    },
    {
      title: 'NITDA National Artificial Intelligence & Robotics Fellowship',
      description: 'Hands-on national fellowship funded by NITDA to train Nigerian university students and young graduates in AI, machine learning, IoT, and embedded robotics.',
      opportunityType: 'Training Program',
      provider: 'National Information Technology Development Agency (NITDA)',
      sourceUrl: 'https://nitda.gov.ng',
      applicationLink: 'https://nitda.gov.ng/initiatives/',
      deadline: new Date('2026-10-18'),
      location: 'Abuja & Regional Hubs (Nigeria)',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate', 'Graduate', 'NYSC'], nationality: 'Nigerian' }),
      requiredDocuments: JSON.stringify(['NIN Identification Slip', 'Curriculum Vitae', 'Statement of Interest in AI & Emerging Tech']),
      applicationSteps: '1. Register on NITDA portal with NIN\n2. Complete online aptitude & problem-solving test\n3. Selection into physical/hybrid training cohorts\n4. Capstone prototyping and exhibition',
      benefits: JSON.stringify(['100% Free Government Training & Hardware Kits', 'Certification from NITDA & International AI Partners', 'Seed Grant Opportunities for Top Capstone Projects', 'Networking with National Policy Makers']),
      tags: JSON.stringify(['Training Program', 'Artificial Intelligence', 'Robotics', 'Tech', 'NITDA']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'IT/Computer Science',
      bannerColor: '#00838F',
    },
    {
      title: 'Commonwealth Shared Scholarships 2027',
      description: 'For candidates from least developed and middle-income Commonwealth countries, to undertake full-time taught Master study at a UK university.',
      opportunityType: 'Scholarship',
      provider: 'Commonwealth Scholarship Commission (CSC UK)',
      sourceUrl: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships/',
      applicationLink: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships/',
      deadline: new Date('2026-12-10'),
      location: 'United Kingdom',
      eligibilityCriteria: JSON.stringify({ education_level: ['Graduate', 'NYSC'], nationality: 'Commonwealth Citizen (Nigeria)', min_degree_class: 'Second Class Upper (2:1)' }),
      requiredDocuments: JSON.stringify(['Undergraduate Degree Certificate', 'Full Official Transcript', 'Two Academic References', 'CSC Electronic Application Form']),
      applicationSteps: '1. Apply for chosen master course at participating UK university\n2. Complete CSC application on official electronic application system\n3. University nominates candidates to CSC\n4. CSC selects and confirms awards',
      benefits: JSON.stringify(['Approved Airfare from Home Country to the UK', 'Full Tuition Fees Paid', 'Monthly Stipend of £1,347 (or £1,652 in London)', 'Warm Clothing Allowance & Thesis Grant']),
      tags: JSON.stringify(['Scholarship', 'Masters', 'UK', 'Fully Funded', 'Commonwealth']),
      educationLevel: 'Masters',
      fieldOfStudy: null,
      bannerColor: '#4527A0',
    },
    {
      title: 'Seplat Energy National Undergraduate Scholarship',
      description: 'Annual educational empowerment scholarship for eligible Nigerian undergraduates in Federal and State Universities across host and non-host communities.',
      opportunityType: 'Scholarship',
      provider: 'Seplat Energy PLC',
      sourceUrl: 'https://seplatenergy.com/sustainability/csr/education/',
      applicationLink: 'https://seplatenergy.com/sustainability/csr/education/',
      deadline: new Date('2026-12-05'),
      location: 'Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate'], nationality: 'Nigerian', min_cgpa: 3.5, year_of_study: [2] }),
      requiredDocuments: JSON.stringify(['Valid University ID Card', 'Admission Letter', 'Statement of Result / CGPA transcript', 'Local Government Identification Letter']),
      applicationSteps: '1. Visit Seplat CSR portal\n2. Complete verification and academic biodata\n3. Take proctored online CBT test\n4. Announcement of awardees on national dailies',
      benefits: JSON.stringify(['₦150,000 Annual Educational Grant', 'Priority for Internship & Industrial Training', 'Executive Coaching & Mentorship']),
      tags: JSON.stringify(['Scholarship', 'Undergraduate', 'Engineering', 'Sciences', 'Energy']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'Engineering',
      bannerColor: '#004D40',
    }
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.create({ data: opp });
  }
  console.log(`  ✅ ${opportunities.length} opportunities seeded`);

  // ── 7. Sample Jobs ─────────────────────────────────
  const jobs = [
    {
      title: 'Junior Fullstack Software Engineer',
      description: 'Build and scale fintech payment APIs and modern frontend interfaces using React, TypeScript, and Node.js.',
      companyName: 'Flutterwave',
      location: 'Lagos & Remote (Nigeria)',
      jobType: 'Full-time',
      salaryRange: '₦350,000 - ₦550,000 / month',
      applicationDeadline: new Date('2026-10-30'),
      requirements: JSON.stringify(['BSc in Computer Science or equivalent practical experience', 'Proficiency with React and Node.js / Express', 'Understanding of RESTful APIs and SQL databases', 'Solid Git workflow and automated testing basics']),
      responsibilities: 'Build responsive client components, develop robust backend microservices, collaborate in agile sprints, and write clean maintainable code.',
      applyUrl: 'https://flutterwave.com/careers',
      tags: JSON.stringify(['Engineering', 'React', 'Node.js', 'Fintech', 'Full-time']),
    },
    {
      title: 'NYSC Data Analyst Intern',
      description: 'Exciting opportunity for serving NYSC corps members to work directly with the business intelligence and product growth analytics teams.',
      companyName: 'PiggyVest',
      location: 'Lagos, Nigeria',
      jobType: 'NYSC',
      salaryRange: '₦120,000 - ₦180,000 / month',
      applicationDeadline: new Date('2026-11-15'),
      requirements: JSON.stringify(['Currently deployed to Lagos State for NYSC', 'Strong foundation in SQL, Excel, and Power BI / Tableau', 'Curiosity for customer data and business insights']),
      responsibilities: 'Analyze transactional patterns, build visual dashboards for team leads, clean raw datasets, and present findings in weekly growth syncs.',
      applyUrl: 'https://piggyvest.com/careers',
      tags: JSON.stringify(['Data Analysis', 'SQL', 'NYSC', 'Fintech', 'Lagos']),
    },
    {
      title: 'Product Design (UI/UX) Intern',
      description: 'Join a fast-growing digital education platform to design intuitive mobile and web flows following Apple Human Interface Guidelines.',
      companyName: 'Kuda Technologies',
      location: 'Remote (Nigeria)',
      jobType: 'Internship',
      salaryRange: '₦150,000 - ₦220,000 / month',
      applicationDeadline: new Date('2026-11-20'),
      requirements: JSON.stringify(['Portfolio showing strong UI/UX mobile and web projects in Figma', 'Understanding of typography, accessibility, and design systems', 'Good user empathy and communication skills']),
      responsibilities: 'Create user journeys, wireframes, high-fidelity prototypes in Figma, and conduct usability tests with students.',
      applyUrl: 'https://kuda.com/careers',
      tags: JSON.stringify(['UI/UX Design', 'Figma', 'Product', 'Internship', 'Remote']),
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }
  console.log(`  ✅ ${jobs.length} jobs seeded`);

  // ── 8. CV Templates ────────────────────────────────
  const templates = [
    { name: 'Classic Professional', description: 'Clean, traditional layout ideal for corporate applications and bank graduate programs.', style: 'classic' },
    { name: 'Modern Minimal', description: 'Sleek design with a dedicated sidebar for tech skills, GitHub projects, and certifications.', style: 'modern' },
    { name: 'Academic & Research', description: 'Detailed format optimized for scholarship committees and international graduate school applications.', style: 'academic' },
    { name: 'Tech & Product', description: 'Bold, typography-driven layout highlighting coding stacks, live app links, and metrics.', style: 'creative' },
  ];

  for (const t of templates) {
    await prisma.cvTemplate.create({ data: t });
  }
  console.log(`  ✅ ${templates.length} CV templates seeded`);

  // ── 9. FAQ Items ───────────────────────────────────
  const faqs = [
    { question: 'How does the match percentage work?', answer: 'Our intelligent matching algorithm evaluates your education level, field of study, CGPA, gender eligibility, location, and verified skills against each opportunity criteria to give you a customized score.', category: 'Features' },
    { question: 'Is OpportunityHub completely free for students?', answer: 'Yes! Core features including discovery, learning roadmaps with free tutorials, and application tracking are 100% free for all students.', category: 'General' },
    { question: 'How do I apply for scholarships on the platform?', answer: 'Click on any opportunity to view the requirements and documents checklist. Then click "Apply Now" to directly open the verified official application portal.', category: 'Applications' },
    { question: 'How do learning roadmaps work?', answer: 'Each roadmap is curated with direct video lessons, reading materials, and practice tasks. You can learn at your own pace and mark steps as complete.', category: 'Learning' },
    { question: 'How does the study streak tracker work?', answer: 'Set your target study days per week. The streak tracks consecutive goal days you achieve and helps you stay disciplined for upcoming deadlines.', category: 'Features' },
  ];

  for (const faq of faqs) {
    await prisma.faqItem.create({ data: faq });
  }
  console.log(`  ✅ ${faqs.length} FAQ items seeded`);

  // ── 10. Learning Roadmaps & Steps with Real Working Video/Resource URLs ─────────────────
  const roadmaps = [
    {
      title: 'JAMB Prep Mastery (UTME 2027)',
      description: 'Complete high-score preparation guide for the Joint Admissions and Matriculation Board UTME exam. Master core concepts, speed techniques, and past questions.',
      category: 'Test Prep',
      estimatedWeeks: 8,
      enrolledCount: 3420,
      icon: '📚',
      steps: [
        { 
          stepNumber: 1, 
          title: 'Understanding JAMB CBT Exam Format & Syllabus', 
          stepType: 'Video', 
          estimatedDurationMinutes: 25, 
          description: 'Comprehensive breakdown of UTME scoring algorithm, 2-hour time management strategy, and novel syllabus requirements.',
          contentUrl: 'https://www.youtube.com/watch?v=cTrTQVqZGTQ'
        },
        { 
          stepNumber: 2, 
          title: 'Use of English: Comprehension & Lexis Drills', 
          stepType: 'Video', 
          estimatedDurationMinutes: 45, 
          description: 'Master fast reading strategies for long passages, sentence completions, antonyms, synonyms, and vowel stress patterns.',
          contentUrl: 'https://www.youtube.com/watch?v=qRv6TGUbWYE'
        },
        { 
          stepNumber: 3, 
          title: 'Mathematics Core: Algebra, Calculus & Statistics', 
          stepType: 'Video', 
          estimatedDurationMinutes: 60, 
          description: 'Shortcuts and step-by-step problem-solving for quadratic equations, matrices, differentiation, and probability.',
          contentUrl: 'https://www.youtube.com/watch?v=LwCRRUa8yTU'
        },
        { 
          stepNumber: 4, 
          title: 'Science / General Studies High-Yield Summary', 
          stepType: 'Article', 
          estimatedDurationMinutes: 35, 
          description: 'High-frequency physics, chemistry, biology, and government topics that appear on 90% of JAMB question papers.',
          contentUrl: 'https://www.youtube.com/watch?v=8j3HsVJkEwQ'
        },
        { 
          stepNumber: 5, 
          title: 'Full-Length Timed CBT Simulation Practice', 
          stepType: 'Practice', 
          estimatedDurationMinutes: 120, 
          description: 'Take a realistic 180-question mock exam under strict 2-hour exam conditions on the official practice engine.',
          contentUrl: 'https://myschool.ng/classroom/exam-hall'
        },
      ]
    },
    {
      title: 'Fullstack React & JavaScript Career Path',
      description: 'Master modern frontend development from vanilla JavaScript ES6+ fundamentals to advanced React patterns, Tailwind CSS, API integration, and portfolio deployment.',
      category: 'Tech Skills',
      estimatedWeeks: 10,
      enrolledCount: 2890,
      icon: '⚛️',
      steps: [
        { 
          stepNumber: 1, 
          title: 'Modern JavaScript (ES6+) Complete Refresher', 
          stepType: 'Video', 
          estimatedDurationMinutes: 60, 
          description: 'Deep dive into arrow functions, destructuring, rest/spread operators, array methods (.map, .filter, .reduce), and async/await promises.',
          contentUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c'
        },
        { 
          stepNumber: 2, 
          title: 'React Fundamentals: Components, Props & JSX', 
          stepType: 'Video', 
          estimatedDurationMinutes: 75, 
          description: 'Understand the virtual DOM, functional components, passing props, and building modular interactive UI components.',
          contentUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0'
        },
        { 
          stepNumber: 3, 
          title: 'State Management with React Hooks (useState, useEffect, useContext)', 
          stepType: 'Video', 
          estimatedDurationMinutes: 60, 
          description: 'Learn how to manage component state, lifecycle side-effects, custom hooks, and global context state like a pro.',
          contentUrl: 'https://www.youtube.com/watch?v=O6P86uwfdR0'
        },
        { 
          stepNumber: 4, 
          title: 'Connecting to REST APIs & Fetching Data in React', 
          stepType: 'Video', 
          estimatedDurationMinutes: 50, 
          description: 'Handling HTTP requests with Axios/Fetch, error states, loading spinners, authentication tokens, and JWT storage.',
          contentUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8'
        },
        { 
          stepNumber: 5, 
          title: 'Build & Deploy a Production Portfolio Project on Vercel', 
          stepType: 'Task', 
          estimatedDurationMinutes: 120, 
          description: 'Package your application, write clean README documentation, configure Git branches, and deploy a live link to showcase to recruiters.',
          contentUrl: 'https://www.youtube.com/watch?v=8JJ101D3KnE'
        },
      ]
    },
    {
      title: 'Scholarship Application & Essay Strategy',
      description: 'Learn step-by-step how to discover prestigious global scholarships, craft compelling personal statements, secure standout recommendation letters, and ace panel interviews.',
      category: 'Scholarship Prep',
      estimatedWeeks: 4,
      enrolledCount: 4120,
      icon: '🏆',
      steps: [
        { 
          stepNumber: 1, 
          title: 'Finding & Shortlisting Winning Scholarships', 
          stepType: 'Video', 
          estimatedDurationMinutes: 30, 
          description: 'How to build your annual scholarship calendar, research fully funded opportunities, and match your unique profile to funder priorities.',
          contentUrl: 'https://www.youtube.com/watch?v=dR8D3VPkbJE'
        },
        { 
          stepNumber: 2, 
          title: 'Crafting an Irresistible Personal Statement (STAR Method)', 
          stepType: 'Video', 
          estimatedDurationMinutes: 50, 
          description: 'Writing compelling hooks, structuring your narrative with the STAR framework, showcasing impact, and avoiding generic cliches.',
          contentUrl: 'https://www.youtube.com/watch?v=GYpPq0cSHXo'
        },
        { 
          stepNumber: 3, 
          title: 'How to Request & Guide Outstanding Recommendation Letters', 
          stepType: 'Article', 
          estimatedDurationMinutes: 25, 
          description: 'Guidelines on approaching professors and employers, providing brag sheets, draft templates, and following up professionally.',
          contentUrl: 'https://www.youtube.com/watch?v=iLLJxX2NGKM'
        },
        { 
          stepNumber: 4, 
          title: 'Mastering the Scholarship Panel Interview', 
          stepType: 'Video', 
          estimatedDurationMinutes: 45, 
          description: 'How to answer difficult leadership and career vision questions with confidence, clarity, and poise.',
          contentUrl: 'https://www.youtube.com/watch?v=xLeRc0fS95Y'
        },
      ]
    },
    {
      title: 'Python for Data Analysis & AI Beginners',
      description: 'A hands-on introduction to data manipulation, visualization, and introductory machine learning with Python, Pandas, and Matplotlib.',
      category: 'Tech Skills',
      estimatedWeeks: 6,
      enrolledCount: 2150,
      icon: '🐍',
      steps: [
        { 
          stepNumber: 1, 
          title: 'Python Programming Basics (Data Types, Loops, Functions)', 
          stepType: 'Video', 
          estimatedDurationMinutes: 60, 
          description: 'Set up Jupyter notebooks, write clean Python scripts, work with lists, dictionaries, and write modular functions.',
          contentUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8'
        },
        { 
          stepNumber: 2, 
          title: 'Data Cleaning & Transformation with Pandas & NumPy', 
          stepType: 'Video', 
          estimatedDurationMinutes: 75, 
          description: 'Loading CSV datasets, filtering null values, calculating group aggregations, and reshaping dataframes.',
          contentUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg'
        },
        { 
          stepNumber: 3, 
          title: 'Visualizing Insights with Matplotlib & Seaborn', 
          stepType: 'Video', 
          estimatedDurationMinutes: 50, 
          description: 'Creating bar charts, scatter plots, correlation heatmaps, and publication-ready graphs.',
          contentUrl: 'https://www.youtube.com/watch?v=UO98lJQ3QGI'
        },
        { 
          stepNumber: 4, 
          title: 'Complete Real-World Data Analysis Case Study', 
          stepType: 'Practice', 
          estimatedDurationMinutes: 90, 
          description: 'Analyze an open dataset from start to finish, extract key business takeaways, and publish your findings on Kaggle or GitHub.',
          contentUrl: 'https://www.kaggle.com/learn/pandas'
        },
      ]
    }
  ];

  for (const rm of roadmaps) {
    const { steps, ...roadmapData } = rm;
    const roadmap = await prisma.learningRoadmap.create({ data: roadmapData });
    for (const step of steps) {
      await prisma.roadmapStep.create({ data: { ...step, roadmapId: roadmap.id } });
    }
  }
  console.log(`  ✅ ${roadmaps.length} learning roadmaps seeded with rich step resources`);

  // ── 11. Courses ─────────────────────────────────────
  const courses = [
    { title: 'Python for Everybody Specialization', provider: 'Coursera (Univ. of Michigan)', url: 'https://www.coursera.org/specializations/python', price: 0, isFree: true, avgRating: 4.8, skillCategory: 'Tech Skills', enrolledCount: 95000, duration: '8 weeks' },
    { title: 'The Complete Fullstack Web Development Bootcamp', provider: 'Udemy', url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/', price: 14.99, isFree: false, currency: 'USD', avgRating: 4.7, skillCategory: 'Tech Skills', enrolledCount: 82000, duration: '12 weeks' },
    { title: 'IELTS Academic English Test Preparation', provider: 'British Council', url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests', price: 0, isFree: true, avgRating: 4.9, skillCategory: 'Test Prep', enrolledCount: 110000, duration: '4 weeks' },
    { title: 'Leadership & High-Impact Communication', provider: 'LinkedIn Learning', url: 'https://www.linkedin.com/learning/communicating-with-confidence', price: 0, isFree: true, avgRating: 4.6, skillCategory: 'Soft Skills', enrolledCount: 45000, duration: '3 weeks' },
    { title: 'Writing Winning Scholarship & Grant Proposals', provider: 'edX (Harvard Online)', url: 'https://www.edx.org', price: 0, isFree: true, avgRating: 4.8, skillCategory: 'Scholarship Prep', enrolledCount: 38000, duration: '5 weeks' },
  ];

  for (const c of courses) {
    await prisma.course.create({ data: c });
  }
  console.log(`  ✅ ${courses.length} courses seeded`);

  // ── 12. Interview Prep ──────────────────────────────
  const interviewCategories = [
    { name: 'Behavioral & Leadership', icon: '🧠', questionCount: 5 },
    { name: 'Software & Tech Skills', icon: '💻', questionCount: 5 },
    { name: 'Scholarship Committees', icon: '🎓', questionCount: 5 },
  ];

  for (const cat of interviewCategories) {
    const createdCat = await prisma.interviewCategory.create({ data: cat });
    
    let questions = [];
    if (cat.name === 'Behavioral & Leadership') {
      questions = [
        { 
          questionText: 'Tell me about a time you led a team through a significant disagreement or obstacle.', 
          tips: 'Use the STAR method (Situation, Task, Action, Result). Highlight empathy, active listening, and measurable outcomes.', 
          sampleAnswer: 'During our 300-level group engineering project, two teammates disagreed strongly on whether to use SQL or NoSQL for our database. As team lead, I organized a 30-minute prototype benchmark test where each teammate demonstrated their schema speed with sample data. Based on the latency results, we objectively selected PostgreSQL, completed the project 4 days before deadline, and received an "A" grade from our supervisor.', 
          pitfalls: 'Blaming teammates, avoiding personal responsibility, or lacking measurable results.' 
        },
        { 
          questionText: 'Where do you see yourself in 5 years, and how does this opportunity align with that vision?', 
          tips: 'Connect your personal passion to specific industry impact and explain how this organization bridges the gap.', 
          sampleAnswer: 'In 5 years, I aim to be a Lead AI Engineer building accessible digital tools for African healthcare. This scholarship provides the rigorous foundation in machine learning and global peer network I need to achieve that milestone.', 
          pitfalls: 'Giving generic answers like "rich and famous" or mentioning goals unrelated to the program.' 
        },
      ];
    } else if (cat.name === 'Software & Tech Skills') {
      questions = [
        { 
          questionText: 'Explain how RESTful APIs work and the difference between GET, POST, PUT, and DELETE.', 
          tips: 'Explain client-server communication, statelessness, HTTP status codes (200, 201, 400, 404, 500), and JSON payloads.', 
          sampleAnswer: 'REST is an architectural standard where clients communicate with servers over HTTP using standardized methods: GET retrieves data without side effects, POST creates new resources, PUT updates existing records idempotently, and DELETE removes resources.', 
          pitfalls: 'Failing to mention idempotency or using incorrect HTTP status codes.' 
        },
        { 
          questionText: 'What is the difference between SQL (relational) and NoSQL (non-relational) databases?', 
          tips: 'Discuss table structure vs document models, ACID transactions vs horizontal scalability.', 
          sampleAnswer: 'SQL databases like PostgreSQL organize structured data into relational tables with strict schemas and ACID guarantees, making them ideal for financial transactions. NoSQL databases like MongoDB store flexible JSON documents that scale horizontally across clusters for rapidly evolving datasets.', 
          pitfalls: 'Claiming one is strictly "better" without explaining architectural trade-offs.' 
        },
      ];
    } else if (cat.name === 'Scholarship Committees') {
      questions = [
        { 
          questionText: 'Why do you deserve this scholarship more than other equally qualified applicants?', 
          tips: 'Focus on your unique combination of resilience, proven community track record, and specific vision for post-study impact.', 
          sampleAnswer: 'While many applicants have strong grades, what sets me apart is how I leverage knowledge to solve local problems. While maintaining a 4.2 CGPA, I founded a free coding circle in my university that has trained over 80 junior students. This scholarship is not just an award for me—it is an investment in the hundreds of students I will continue to empower upon return.', 
          pitfalls: 'Sounding arrogant or disparaging other applicants.' 
        },
      ];
    }

    for (const q of questions) {
      await prisma.interviewQuestion.create({
        data: {
          ...q,
          categoryId: createdCat.id
        }
      });
    }
  }
  console.log(`  ✅ Interview categories and detailed questions seeded`);

  // ── 13. Test Prep ───────────────────────────────────
  const testTypes = [
    { name: 'JAMB UTME Practice Exam', description: 'Simulated practice test covering English, Math, and General Knowledge.', questionCount: 3, timeLimit: 10, icon: '📝' },
    { name: 'General Aptitude & Logical Reasoning', description: 'Numerical, verbal, and abstract problem solving for scholarship and graduate exams.', questionCount: 3, timeLimit: 8, icon: '🧮' },
  ];

  for (const t of testTypes) {
    const createdType = await prisma.testType.create({ data: t });
    
    let tQuestions = [];
    if (t.name === 'JAMB UTME Practice Exam') {
      tQuestions = [
        { questionText: 'What is the official administrative capital city of Nigeria?', options: JSON.stringify(['Lagos', 'Abuja', 'Kano', 'Port Harcourt']), correctAnswer: 1, explanation: 'Abuja officially became the Federal Capital Territory of Nigeria in December 1991.', subject: 'General Knowledge' },
        { questionText: 'Solve for x in the linear algebraic equation: 3x - 7 = 14', options: JSON.stringify(['x = 5', 'x = 7', 'x = 21', 'x = 9']), correctAnswer: 1, explanation: 'Adding 7 to both sides gives 3x = 21. Dividing by 3 gives x = 7.', subject: 'Mathematics' },
        { questionText: 'Identify the word with the correct spelling:', options: JSON.stringify(['Acomodation', 'Accommodation', 'Accommodateion', 'Acommodation']), correctAnswer: 1, explanation: '"Accommodation" is spelled with double "c" and double "m".', subject: 'Use of English' }
      ];
    } else if (t.name === 'General Aptitude & Logical Reasoning') {
      tQuestions = [
        { questionText: 'If all bloops are razzies and all razzies are lazzies, are all bloops guaranteed to be lazzies?', options: JSON.stringify(['Yes, definitively', 'No, never', 'Only under certain conditions', 'Cannot be logically determined']), correctAnswer: 0, explanation: 'By the transitive property of deductive logic: A ⊆ B and B ⊆ C implies A ⊆ C.', subject: 'Logical Deduction' },
        { questionText: 'Identify the next number in the arithmetic sequence: 3, 9, 27, 81, ?', options: JSON.stringify(['162', '243', '324', '729']), correctAnswer: 1, explanation: 'Each subsequent term is multiplied by 3 (powers of 3): 81 * 3 = 243.', subject: 'Numerical Reasoning' },
        { questionText: 'A laptop and a protective sleeve cost ₦210,000 in total. The laptop costs ₦200,000 more than the sleeve. How much does the sleeve cost?', options: JSON.stringify(['₦5,000', '₦10,000', '₦15,000', '₦20,000']), correctAnswer: 0, explanation: 'Let sleeve = x. Laptop = x + 200,000. x + (x + 200,000) = 210,000 -> 2x = 10,000 -> x = ₦5,000.', subject: 'Quantitative Aptitude' }
      ];
    }

    for (const tq of tQuestions) {
      await prisma.testQuestion.create({
        data: {
          ...tq,
          testTypeId: createdType.id
        }
      });
    }
  }
  console.log(`  ✅ Test prep types and questions seeded`);

  // ── 14. Community Groups & Posts ────────────────────────
  const groups = [
    { name: 'Scholarship Hunters Nigeria 🇳🇬', description: 'Active community sharing verified scholarship notices, essay reviews, and application tips.', icon: '🎯', groupType: 'Public', createdById: testUser.id },
    { name: 'Tech Career & Internship Hub 💻', description: 'Connect with software engineers, designers, and data analysts across Nigeria.', icon: '💻', groupType: 'Public', createdById: testUser.id },
    { name: 'JAMB & Post-UTME Aspirants 📚', description: 'Study groups, past question solutions, and admission advice for Nigerian universities.', icon: '📚', groupType: 'Public', createdById: testUser.id }
  ];

  for (const g of groups) {
    const group = await prisma.communityGroup.create({ data: g });
    await prisma.groupMember.create({
      data: { groupId: group.id, userId: testUser.id }
    });
    
    if (g.name.includes('Scholarship')) {
      await prisma.post.createMany({
        data: [
          { groupId: group.id, userId: testUser.id, content: 'Reminder to all applying for the TotalEnergies scholarship: make sure your student ID and matric letter are clearly scanned and under 2MB before uploading to avoid portal rejection!', upvotes: 14, commentCount: 3 },
          { groupId: group.id, userId: testUser.id, content: 'Pro-tip for Chevening and Commonwealth essays: Always structure each paragraph using the STAR (Situation, Task, Action, Result) method. Reviewers score you heavily on quantifiable impact!', upvotes: 28, commentCount: 7 }
        ]
      });
    }
  }
  console.log(`  ✅ Community groups and posts seeded`);

  console.log('\n🎉 Production-ready Database seeded successfully!\n');
  console.log('  Test login credentials:');
  console.log('  📧 Email: student@opportunityhub.ng');
  console.log('  🔑 Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
