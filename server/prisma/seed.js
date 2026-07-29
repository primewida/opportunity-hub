/**
 * Seed script — populates the database with initial data
 * Run: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

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
    update: {},
    create: {
      email: 'student@opportunityhub.ng',
      passwordHash,
      firstName: 'Adaeze',
      lastName: 'Okafor',
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

  // ── 6. Sample Opportunities ────────────────────────
  const opportunities = [
    {
      title: 'NNPC/TotalEnergies National Merit Scholarship',
      description: 'Full scholarship for Nigerian undergraduates in STEM fields with excellent academic records.',
      opportunityType: 'Scholarship',
      provider: 'NNPC/TotalEnergies',
      sourceUrl: 'https://scholarships.totalenergies.com/ng',
      applicationLink: 'https://scholarships.totalenergies.com/ng/apply',
      deadline: new Date('2026-09-30'),
      location: 'Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate'], nationality: 'Nigerian', min_cgpa: 3.5 }),
      requiredDocuments: JSON.stringify(['WAEC Certificate', 'University Transcript', 'JAMB Result', 'Passport Photo']),
      applicationSteps: 'Visit the portal → Create account → Fill application → Upload documents → Submit',
      benefits: JSON.stringify(['Full tuition', 'Book allowance', 'Monthly stipend']),
      tags: JSON.stringify(['Scholarship', 'STEM', 'Undergraduate']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'Engineering',
      bannerColor: '#00A86B',
    },
    {
      title: 'Google Africa Developer Scholarship',
      description: 'Learn Android, Cloud, or Mobile Web development with Google. Get certified and connect with a community of developers across Africa.',
      opportunityType: 'Training Program',
      provider: 'Google',
      sourceUrl: 'https://gads.andela.com',
      applicationLink: 'https://gads.andela.com/apply',
      deadline: new Date('2026-08-15'),
      location: 'Remote',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate', 'Graduate', 'SSS'], nationality: 'African' }),
      requiredDocuments: JSON.stringify([]),
      applicationSteps: 'Apply online → Take assessment → Join learning track → Complete projects → Get certified',
      benefits: JSON.stringify(['Free training', 'Google certification', 'Mentorship', 'Job placement support']),
      tags: JSON.stringify(['Training', 'Tech', 'Google', 'Remote']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'IT/Computer Science',
      bannerColor: '#4285F4',
    },
    {
      title: 'Nigerian Women in Tech Internship Program',
      description: 'A 6-month paid internship for female students in technology fields at top Nigerian tech companies.',
      opportunityType: 'Internship',
      provider: 'She Code Africa',
      sourceUrl: 'https://shecodeafrica.org/programs',
      applicationLink: 'https://shecodeafrica.org/apply',
      deadline: new Date('2026-08-20'),
      location: 'Lagos, Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate', 'Graduate'], gender: 'Female', nationality: 'Nigerian' }),
      requiredDocuments: JSON.stringify(['CV', 'Cover Letter', 'University ID']),
      applicationSteps: 'Apply online → Technical assessment → Interview → Placement',
      benefits: JSON.stringify(['Monthly stipend', 'Mentorship', 'Job offer potential', 'Training']),
      tags: JSON.stringify(['Internship', 'Women', 'Tech']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: 'IT/Computer Science',
      bannerColor: '#E91E63',
    },
    {
      title: 'Chevening Scholarship 2026/2027',
      description: 'Fully funded Masters scholarship in any UK university for future leaders and influencers from Nigeria.',
      opportunityType: 'Scholarship',
      provider: 'UK Government',
      sourceUrl: 'https://www.chevening.org/scholarships/',
      applicationLink: 'https://www.chevening.org/apply/',
      deadline: new Date('2026-11-02'),
      location: 'United Kingdom',
      eligibilityCriteria: JSON.stringify({ education_level: ['Graduate', 'NYSC'], nationality: 'Nigerian', work_experience_years: 2 }),
      requiredDocuments: JSON.stringify(['Degree Certificate', 'Transcript', 'CV', 'References (2)', 'Personal Statement']),
      applicationSteps: 'Online application → Select 3 UK universities → Submit essays → Interview → Award',
      benefits: JSON.stringify(['Full tuition', 'Living allowance', 'Return flights', 'Thesis grant', 'Travel grant']),
      tags: JSON.stringify(['Scholarship', 'Masters', 'UK', 'Fully Funded']),
      educationLevel: 'Masters',
      fieldOfStudy: null,
      bannerColor: '#1A237E',
    },
    {
      title: 'MTN Foundation Scholarship',
      description: 'Annual scholarship for first-year university students in Nigerian federal and state universities.',
      opportunityType: 'Scholarship',
      provider: 'MTN Nigeria Foundation',
      sourceUrl: 'https://mtnonline.com/mtn-foundation/scholarships',
      applicationLink: 'https://mtnonline.com/mtn-foundation/apply',
      deadline: new Date('2026-10-15'),
      location: 'Nigeria',
      eligibilityCriteria: JSON.stringify({ education_level: ['Undergraduate'], nationality: 'Nigerian', year_of_study: 1 }),
      requiredDocuments: JSON.stringify(['JAMB Result', 'Admission Letter', 'WAEC Certificate', 'Local Government ID']),
      applicationSteps: 'Apply on MTN Foundation portal → Submit documents → Selection → Award ceremony',
      benefits: JSON.stringify(['Tuition coverage', 'Book allowance']),
      tags: JSON.stringify(['Scholarship', 'Undergraduate', 'MTN']),
      educationLevel: 'Undergraduate',
      fieldOfStudy: null,
      bannerColor: '#FFCC00',
    },
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.create({ data: opp });
  }
  console.log(`  ✅ ${opportunities.length} opportunities seeded`);

  // ── 7. Sample Jobs ─────────────────────────────────
  const jobs = [
    {
      title: 'Junior Software Developer',
      description: 'Build and maintain web applications using React and Node.js.',
      companyName: 'Andela Nigeria',
      location: 'Lagos, Nigeria',
      jobType: 'Full-time',
      salaryRange: '₦250,000 - ₦400,000',
      applicationDeadline: new Date('2026-09-01'),
      requirements: JSON.stringify(['BSc Computer Science', '1+ years experience', 'React', 'Node.js']),
      responsibilities: 'Develop features, write tests, participate in code reviews.',
      applyUrl: 'https://andela.com/careers',
      tags: JSON.stringify(['Software', 'React', 'Full-time']),
    },
    {
      title: 'NYSC Data Analyst Intern',
      description: 'Support the analytics team with data collection, cleaning, and visualization.',
      companyName: 'Flutterwave',
      location: 'Lagos, Nigeria',
      jobType: 'NYSC',
      salaryRange: '₦100,000 - ₦150,000',
      applicationDeadline: new Date('2026-08-30'),
      requirements: JSON.stringify(['NYSC member', 'Excel/SQL proficiency', 'Analytical skills']),
      responsibilities: 'Clean data, create dashboards, generate reports for stakeholders.',
      applyUrl: 'https://flutterwave.com/careers',
      tags: JSON.stringify(['Data', 'NYSC', 'Fintech']),
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }
  console.log(`  ✅ ${jobs.length} jobs seeded`);

  // ── 8. CV Templates ────────────────────────────────
  const templates = [
    { name: 'Classic Professional', description: 'Clean, traditional layout ideal for corporate applications.', style: 'classic' },
    { name: 'Modern Minimal', description: 'Sleek design with a sidebar for skills and contact info.', style: 'modern' },
    { name: 'Academic', description: 'Detailed format for scholarship and graduate applications.', style: 'academic' },
    { name: 'Creative', description: 'Bold design with color accents for creative industries.', style: 'creative' },
  ];

  for (const t of templates) {
    await prisma.cvTemplate.create({ data: t });
  }
  console.log(`  ✅ ${templates.length} CV templates seeded`);

  // ── 9. FAQ Items ───────────────────────────────────
  const faqs = [
    { question: 'How does the match percentage work?', answer: 'Our algorithm compares your profile (education level, field of study, CGPA, skills, location) against each opportunity\'s eligibility criteria. The percentage reflects how well you match.', category: 'Features' },
    { question: 'Is OpportunityHub free?', answer: 'Yes! Core features including opportunity discovery, learning roadmaps, and application tracking are completely free. Premium AI-powered features are available for subscribers.', category: 'General' },
    { question: 'How do I track my applications?', answer: 'Use the Application Tracker (Kanban board) to move applications through stages: Saved → Preparing → Applied → Interviewing → Accepted/Rejected.', category: 'Features' },
    { question: 'Can I get my CV reviewed?', answer: 'Yes! Submit your CV for peer review from other students or request AI-powered feedback for instant analysis.', category: 'Tools' },
    { question: 'How does the streak system work?', answer: 'Set your own learning schedule and daily goals. The streak tracks consecutive goal days you meet — it adapts to YOUR schedule, not a rigid daily requirement.', category: 'Features' },
  ];

  for (const faq of faqs) {
    await prisma.faqItem.create({ data: faq });
  }
  console.log(`  ✅ ${faqs.length} FAQ items seeded`);

// ── 10. Learning Roadmaps & Steps ─────────────────
const roadmaps = [
  {
    title: 'JAMB Prep Mastery',
    description: 'Complete preparation guide for UTME. Covers English, Mathematics, and General Studies.',
    category: 'Test Prep',
    estimatedWeeks: 8,
    enrolledCount: 1250,
    icon: '📚',
    steps: [
      { stepNumber: 1, title: 'Understanding JAMB Format', stepType: 'Article', estimatedDurationMinutes: 30, description: 'Overview of UTME structure, scoring, and time management' },
      { stepNumber: 2, title: 'English Comprehension Drills', stepType: 'Practice', estimatedDurationMinutes: 60, description: 'Practice passages and vocabulary' },
      { stepNumber: 3, title: 'Mathematics Fundamentals', stepType: 'Video', estimatedDurationMinutes: 45, description: 'Key formulas and problem-solving strategies' },
      { stepNumber: 4, title: 'General Studies Revision', stepType: 'Article', estimatedDurationMinutes: 40, description: 'Current affairs, history, and general knowledge' },
      { stepNumber: 5, title: 'Mock JAMB Test', stepType: 'Quiz', estimatedDurationMinutes: 120, description: 'Full-length practice exam' },
    ]
  },
  {
    title: 'React Developer Roadmap',
    description: 'Master modern React development from basics to advanced patterns. Build portfolio-ready projects.',
    category: 'Tech Skills',
    estimatedWeeks: 12,
    enrolledCount: 890,
    icon: '⚛️',
    steps: [
      { stepNumber: 1, title: 'JavaScript ES6+ Refresher', stepType: 'Article', estimatedDurationMinutes: 60 },
      { stepNumber: 2, title: 'React Fundamentals', stepType: 'Video', estimatedDurationMinutes: 90 },
      { stepNumber: 3, title: 'State Management with Hooks', stepType: 'Practice', estimatedDurationMinutes: 60 },
      { stepNumber: 4, title: 'API Integration & Data Fetching', stepType: 'Practice', estimatedDurationMinutes: 75 },
      { stepNumber: 5, title: 'Build a Portfolio Project', stepType: 'Task', estimatedDurationMinutes: 180 },
    ]
  },
  {
    title: 'Scholarship Application Strategy',
    description: 'Learn to write winning scholarship applications. Covers essays, recommendations, and interviews.',
    category: 'Scholarship Prep',
    estimatedWeeks: 4,
    enrolledCount: 2100,
    icon: '🏆',
    steps: [
      { stepNumber: 1, title: 'Finding the Right Scholarships', stepType: 'Article', estimatedDurationMinutes: 30 },
      { stepNumber: 2, title: 'Crafting Your Personal Statement', stepType: 'Practice', estimatedDurationMinutes: 60 },
      { stepNumber: 3, title: 'Getting Strong Recommendations', stepType: 'Article', estimatedDurationMinutes: 25 },
      { stepNumber: 4, title: 'Interview Preparation', stepType: 'Video', estimatedDurationMinutes: 45 },
    ]
  },
];

for (const rm of roadmaps) {
  const { steps, ...roadmapData } = rm;
  const roadmap = await prisma.learningRoadmap.create({ data: roadmapData });
  for (const step of steps) {
    await prisma.roadmapStep.create({ data: { ...step, roadmapId: roadmap.id } });
  }
}
console.log(`  ✅ ${roadmaps.length} learning roadmaps seeded`);

// ── 11. Courses ─────────────────────────────────────
const courses = [
  { title: 'Python for Data Science', provider: 'Coursera', url: 'https://coursera.org/python-ds', price: 0, isFree: true, avgRating: 4.7, skillCategory: 'Tech Skills', enrolledCount: 45000, duration: '8 weeks' },
  { title: 'Advanced React Patterns', provider: 'Udemy', url: 'https://udemy.com/react-patterns', price: 12.99, isFree: false, currency: 'USD', avgRating: 4.5, skillCategory: 'Tech Skills', enrolledCount: 12000, duration: '6 weeks' },
  { title: 'IELTS Academic Prep', provider: 'British Council', url: 'https://britishcouncil.org/ielts', price: 0, isFree: true, avgRating: 4.8, skillCategory: 'Test Prep', enrolledCount: 78000, duration: '4 weeks' },
  { title: 'Leadership & Team Management', provider: 'LinkedIn Learning', url: 'https://linkedin.com/learning/leadership', price: 0, isFree: true, avgRating: 4.3, skillCategory: 'Soft Skills', enrolledCount: 23000, duration: '3 weeks' },
  { title: 'Technical Writing Masterclass', provider: 'Udemy', url: 'https://udemy.com/tech-writing', price: 9.99, isFree: false, currency: 'USD', avgRating: 4.6, skillCategory: 'Soft Skills', enrolledCount: 8500, duration: '5 weeks' },
];

for (const c of courses) {
  await prisma.course.create({ data: c });
}
console.log(`  ✅ ${courses.length} courses seeded`);

  // ── 12. Interview Prep ──────────────────────────────
  const interviewCategories = [
    { name: 'Behavioral', icon: '🧠', questionCount: 5 },
    { name: 'Technical', icon: '💻', questionCount: 5 },
    { name: 'Scholarship', icon: '🎓', questionCount: 5 },
  ];

  for (const cat of interviewCategories) {
    const createdCat = await prisma.interviewCategory.create({ data: cat });
    
    let questions = [];
    if (cat.name === 'Behavioral') {
      questions = [
        { questionText: 'Tell me about yourself', tips: 'Keep it professional and concise.', sampleAnswer: 'I am a software engineer...', pitfalls: 'Rambling about personal life' },
        { questionText: 'Describe a challenging situation you overcame', tips: 'Use the STAR method.', sampleAnswer: 'In my last project...', pitfalls: 'Blaming others' },
        { questionText: 'Where do you see yourself in 5 years?', tips: 'Align with the company goals.', sampleAnswer: 'I see myself leading a team...', pitfalls: 'Being unrealistic' }
      ];
    } else if (cat.name === 'Technical') {
      questions = [
        { questionText: 'Explain the concept of RESTful APIs', tips: 'Mention HTTP methods.', sampleAnswer: 'REST is an architectural style...', pitfalls: 'Confusing it with SOAP' },
        { questionText: 'What is the difference between SQL and NoSQL?', tips: 'Discuss relational vs non-relational.', sampleAnswer: 'SQL is relational...', pitfalls: 'Saying one is always better' },
        { questionText: 'Explain Big O notation', tips: 'Define it simply.', sampleAnswer: 'It describes algorithm efficiency...', pitfalls: 'Getting too mathematical' }
      ];
    } else if (cat.name === 'Scholarship') {
      questions = [
        { questionText: 'Why do you deserve this scholarship?', tips: 'Highlight your achievements and need.', sampleAnswer: 'I have maintained a high GPA...', pitfalls: 'Sounding entitled' },
        { questionText: 'How will this scholarship impact your career?', tips: 'Be specific about your goals.', sampleAnswer: 'It will allow me to focus on studies...', pitfalls: 'Vague answers' },
        { questionText: 'What are your leadership experiences?', tips: 'Mention specific roles.', sampleAnswer: 'I led the computer club...', pitfalls: 'Exaggerating roles' }
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
  console.log(`  ✅ Interview categories and questions seeded`);

  // ── 13. Test Prep ───────────────────────────────────
  const testTypes = [
    { name: 'JAMB Practice', description: 'Practice for UTME', questionCount: 5, timeLimit: 10, icon: '📝' },
    { name: 'Aptitude Test', description: 'General aptitude assessment', questionCount: 5, timeLimit: 8, icon: '🧮' },
  ];

  for (const t of testTypes) {
    const createdType = await prisma.testType.create({ data: t });
    
    let tQuestions = [];
    if (t.name === 'JAMB Practice') {
      tQuestions = [
        { questionText: 'What is the capital of Nigeria?', options: JSON.stringify(['Lagos', 'Abuja', 'Kano', 'Port Harcourt']), correctAnswer: 1, explanation: 'Abuja is the capital city.', subject: 'General' },
        { questionText: 'Solve for x: 2x = 4', options: JSON.stringify(['1', '2', '3', '4']), correctAnswer: 1, explanation: 'x = 4/2 = 2', subject: 'Math' },
        { questionText: 'Choose the correct spelling:', options: JSON.stringify(['Acomodation', 'Accommodation', 'Accomodation', 'Acommodation']), correctAnswer: 1, explanation: 'Two cs and two ms.', subject: 'English' }
      ];
    } else if (t.name === 'Aptitude Test') {
      tQuestions = [
        { questionText: 'If all bloops are razzies and all razzies are lazzies, are all bloops lazzies?', options: JSON.stringify(['Yes', 'No', 'Maybe', 'Cannot be determined']), correctAnswer: 0, explanation: 'Transitive property of logic.', subject: 'Logic' },
        { questionText: 'What comes next in the sequence: 2, 4, 8, 16, ?', options: JSON.stringify(['24', '32', '64', '128']), correctAnswer: 1, explanation: 'Multiply by 2.', subject: 'Logic' },
        { questionText: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?', options: JSON.stringify(['$0.05', '$0.10', '$0.15', '$0.20']), correctAnswer: 0, explanation: 'x + (x + 1) = 1.10 -> 2x = 0.10 -> x = 0.05', subject: 'Logic' }
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
  console.log(`  ✅ Test types and questions seeded`);

  // ── 12. Community & Mentors Seed Data ────────────────────────
  const groups = [
    { name: 'Scholarship Hunters Nigeria', description: 'Find and share scholarship opportunities', icon: '🎯', groupType: 'Public', createdById: testUser.id },
    { name: 'Tech Career Path', description: 'Discuss tech career strategies', icon: '💻', groupType: 'Public', createdById: testUser.id },
    { name: 'NYSC Corps Members', description: 'Connect with fellow corps members', icon: '🇳🇬', groupType: 'Public', createdById: testUser.id }
  ];

  for (const g of groups) {
    const group = await prisma.communityGroup.create({ data: g });
    await prisma.groupMember.create({
      data: { groupId: group.id, userId: testUser.id }
    });
    
    if (g.name === 'Scholarship Hunters Nigeria') {
      await prisma.post.createMany({
        data: [
          { groupId: group.id, userId: testUser.id, content: 'Just got the Chevening Scholarship notification! Application window opens next month. Who else is applying?' },
          { groupId: group.id, userId: testUser.id, content: 'Tips for writing scholarship essays: Be specific, use real examples, and always connect to your future goals.' }
        ]
      });
    }
  }
  console.log(`  ✅ Community groups and posts seeded`);

  const mentorUsers = [
    { email: 'mentor1@example.com', firstName: 'Emeka', lastName: 'Obi', educationLevel: 'Masters', institutionName: 'MIT' },
    { email: 'mentor2@example.com', firstName: 'Fatima', lastName: 'Abubakar', educationLevel: 'PhD', institutionName: 'Oxford' }
  ];
  
  const mentorsData = [
    { bio: 'Software Engineer at Google...', mentoringTopics: '["Software Engineering","Interview Prep"]', availability: 'Weekends', rating: 4.8, isVerified: true },
    { bio: 'Chevening Scholar, Research Fellow...', mentoringTopics: '["Scholarship Applications","Research"]', availability: 'Evenings', rating: 4.9, isVerified: true }
  ];

  for (let i = 0; i < mentorUsers.length; i++) {
    const mu = mentorUsers[i];
    const user = await prisma.user.upsert({
      where: { email: mu.email },
      update: {},
      create: {
        ...mu,
        passwordHash,
        onboardingCompleted: true
      }
    });
    await prisma.mentor.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        ...mentorsData[i]
      }
    });
  }
  console.log(`  ✅ Mentors seeded`);

  console.log('\n🎉 Database seeded successfully!\n');
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
