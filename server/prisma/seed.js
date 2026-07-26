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
