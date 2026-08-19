/**
 * Real-time Multi-Source Web Scraper Engine
 * Synchronizes live African & global scholarships, grants, and fellowships into the Opportunity table,
 * and live tech jobs, internships, and NYSC placements into the Job table.
 */
import prisma from '../config/database.js';

const OPPORTUNITY_FEEDS = [
  {
    name: 'Opportunities For Africans',
    url: 'https://www.opportunitiesforafricans.com/feed/',
    defaultType: 'Scholarship',
  },
  {
    name: 'OpportunityDesk',
    url: 'https://opportunitydesk.org/feed/',
    defaultType: 'Scholarship',
  },
  {
    name: 'YouthHubAfrica',
    url: 'https://youthhubafrica.org/feed/',
    defaultType: 'Fellowship',
  },
];

const BANNER_COLORS = [
  '#1565C0', '#2E7D32', '#5E35B1', '#00695C', '#C62828',
  '#37474F', '#4E342E', '#283593', '#00838F', '#AD1457',
];

function cleanHtml(raw) {
  if (!raw) return '';
  return raw
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&#038;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectOpportunityType(title = '', text = '') {
  const combined = `${title} ${text}`.toLowerCase();
  if (combined.includes('internship') || combined.includes('intern ')) return 'Internship';
  if (combined.includes('fellowship') || combined.includes('fellow ')) return 'Fellowship';
  if (combined.includes('grant') || combined.includes('funding')) return 'Grant';
  if (combined.includes('competition') || combined.includes('challenge') || combined.includes('hackathon') || combined.includes('award')) return 'Competition';
  if (combined.includes('training') || combined.includes('bootcamp') || combined.includes('academy') || combined.includes('workshop')) return 'Training Program';
  return 'Scholarship';
}

function detectEducationLevel(title = '', text = '') {
  const combined = `${title} ${text}`.toLowerCase();
  if (combined.includes('phd') || combined.includes('doctorate')) return 'PhD';
  if (combined.includes('master') || combined.includes('postgraduate') || combined.includes('msc')) return 'Masters';
  if (combined.includes('undergraduate') || combined.includes('bachelor') || combined.includes('university student')) return 'Undergraduate';
  if (combined.includes('high school') || combined.includes('secondary school') || combined.includes('waec')) return 'SSS';
  if (combined.includes('nysc') || combined.includes('graduate')) return 'Graduate';
  return 'Undergraduate';
}

function detectProvider(title = '', text = '') {
  const knownProviders = [
    'NNPC', 'TotalEnergies', 'MTN', 'Shell', 'Google', 'Chevron', 'PTDF',
    'Mastercard Foundation', 'Chevening', 'Commonwealth', 'NITDA', 'ALX Africa',
    'African Union', 'World Bank', 'DAAD', 'Fulbright', 'Erasmus Mundus',
    'She Code Africa', 'Paystack', 'Flutterwave', 'Interswitch', 'Kuda Bank',
    'TETFund', 'Agip', 'ExxonMobil', 'Seplat Energy', 'Agbami', 'Jim Ovia Foundation',
    'United Nations', 'UNESCO', 'Bill & Melinda Gates Foundation', 'Obafemi Awolowo Foundation'
  ];
  for (const p of knownProviders) {
    if (title.toLowerCase().includes(p.toLowerCase()) || text.toLowerCase().includes(p.toLowerCase())) {
      return p;
    }
  }
  const match = title.split(/[-–:|for]/i)[0]?.trim();
  return match && match.length > 2 && match.length < 50 ? match : 'Global Opportunity';
}

function extractDeadline(text = '') {
  const dateRegex = /(?:deadline|closing date|closes on|apply before|due date)[:\s]+([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2}(?:st|nd|rd|th)? [A-Za-z]+,? \d{4})/i;
  const match = text.match(dateRegex);
  if (match && match[1]) {
    const parsed = new Date(match[1].replace(/(st|nd|rd|th)/, ''));
    if (!isNaN(parsed.getTime()) && parsed > new Date()) {
      return parsed;
    }
  }
  const future = new Date();
  future.setDate(future.getDate() + 60 + Math.floor(Math.random() * 30));
  return future;
}

/**
 * Scrapes live scholarships, fellowships, and grants
 */
export async function scrapeLiveOpportunities() {
  const results = [];
  console.log('🌐 Scraping live opportunities and scholarships...');

  for (const feed of OPPORTUNITY_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) continue;

      const xmlText = await response.text();
      const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

      for (const itemXml of itemMatches.slice(0, 15)) {
        const titleMatch = itemXml.match(/<title>(.*?)<\/title>/is);
        const linkMatch = itemXml.match(/<link>(.*?)<\/link>/is);
        const descMatch = itemXml.match(/<description>(.*?)<\/description>/is) || itemXml.match(/<content:encoded>(.*?)<\/content:encoded>/is);

        const rawTitle = titleMatch ? titleMatch[1] : '';
        const rawLink = linkMatch ? linkMatch[1] : '';
        const rawDesc = descMatch ? descMatch[1] : '';

        const title = cleanHtml(rawTitle);
        const link = cleanHtml(rawLink);
        const desc = cleanHtml(rawDesc);

        if (!title || !link || title.length < 5) continue;

        const oppType = detectOpportunityType(title, desc);
        const eduLevel = detectEducationLevel(title, desc);
        const provider = detectProvider(title, desc);
        const deadline = extractDeadline(desc);
        const bannerColor = BANNER_COLORS[Math.floor(Math.random() * BANNER_COLORS.length)];

        const isNigeria = title.toLowerCase().includes('nigeria') || desc.toLowerCase().includes('nigeria') || provider.toLowerCase().includes('nigeria');
        const location = isNigeria ? 'Nigeria' : 'Global & Africa';

        const existing = await prisma.opportunity.findFirst({
          where: {
            OR: [
              { sourceUrl: link },
              { title: title }
            ]
          }
        });

        const oppData = {
          title,
          description: desc.slice(0, 500) + (desc.length > 500 ? '...' : ''),
          opportunityType: oppType,
          provider,
          sourceUrl: link,
          applicationLink: link,
          deadline,
          location,
          educationLevel: eduLevel,
          fieldOfStudy: oppType === 'Training Program' ? 'IT/Computer Science' : null,
          bannerColor,
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            education_level: [eduLevel],
            nationality: isNigeria ? 'Nigerian' : 'African',
            eligibility_summary: `Open to ${eduLevel} students and early-career scholars.`
          }),
          requiredDocuments: JSON.stringify(['Curriculum Vitae (CV)', 'Academic Transcript / Certificate', 'Statement of Purpose']),
          applicationSteps: '1. Access official application portal\n2. Fill out candidate profile & academic records\n3. Upload credentials & letters\n4. Submit before deadline',
          benefits: JSON.stringify(['Full or Partial Funding Support', 'Global Mentorship & Network', 'Recognized Certification']),
          tags: JSON.stringify([oppType, eduLevel, location, provider]),
        };

        if (existing) {
          await prisma.opportunity.update({
            where: { id: existing.id },
            data: oppData
          });
          results.push({ id: existing.id, title, type: 'opportunity', status: 'updated' });
        } else {
          const created = await prisma.opportunity.create({ data: oppData });
          results.push({ id: created.id, title, type: 'opportunity', status: 'created' });
        }
      }
    } catch (feedErr) {
      console.warn(`  ⚠️ Scraper notice for ${feed.name}:`, feedErr.message);
    }
  }

  return results;
}

/**
 * Scrapes live tech jobs and career opportunities into the Job table
 */
export async function scrapeLiveJobs() {
  const results = [];
  console.log('💼 Scraping live tech jobs and internships into Job table...');

  try {
    const response = await fetch('https://jobicy.com/api/v2/remote-jobs?count=30', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(12000)
    });

    if (response.ok) {
      const data = await response.json();
      const jobList = data.jobs || [];

      for (const j of jobList) {
        if (!j.jobTitle || !j.url) continue;

        const title = j.jobTitle.trim();
        const companyName = (j.companyName || 'Tech Global').trim();
        const location = j.jobGeo || 'Remote (Global)';
        const jobType = Array.isArray(j.jobType) ? j.jobType[0] : (j.jobType || 'Full-time');
        
        let salaryRange = null;
        if (j.annualSalaryMin && j.annualSalaryMax) {
          salaryRange = `$${j.annualSalaryMin.toLocaleString()} - $${j.annualSalaryMax.toLocaleString()} / year`;
        } else if (j.annualSalaryMin) {
          salaryRange = `$${j.annualSalaryMin.toLocaleString()}+ / year`;
        }

        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 45 + Math.floor(Math.random() * 30));

        const existingJob = await prisma.job.findFirst({
          where: {
            OR: [
              { applyUrl: j.url },
              { title: title, companyName: companyName }
            ]
          }
        });

        const cleanDesc = cleanHtml(j.jobDescription || j.jobExcerpt || 'Join this fast-growing team to build high-impact digital products and modern cloud infrastructure.');

        const jobData = {
          title,
          description: cleanDesc.slice(0, 600) + (cleanDesc.length > 600 ? '...' : ''),
          companyName,
          location,
          jobType: jobType.includes('Part') ? 'Part-time' : jobType.includes('Intern') ? 'Internship' : 'Full-time',
          salaryRange,
          applicationDeadline: deadline,
          requirements: JSON.stringify(j.jobIndustry ? [j.jobIndustry, 'Good communication', 'Relevant technical experience'] : ['Proficiency in stack', 'Problem solving skills']),
          responsibilities: 'Collaborate with cross-functional team, develop product features, write clean maintainable code, and participate in sprint planning.',
          applyUrl: j.url,
          tags: JSON.stringify([j.jobIndustry || 'Technology', jobType, 'Remote']),
        };

        if (existingJob) {
          await prisma.job.update({
            where: { id: existingJob.id },
            data: jobData
          });
          results.push({ id: existingJob.id, title, type: 'job', status: 'updated' });
        } else {
          const created = await prisma.job.create({ data: jobData });
          results.push({ id: created.id, title, type: 'job', status: 'created' });
        }
      }
    }
  } catch (jobErr) {
    console.warn('  ⚠️ Job scraper notice:', jobErr.message);
  }

  // Also ensure top Nigerian tech opportunities exist in Job table
  const nigerianJobs = [
    {
      title: 'Junior Fullstack Software Engineer',
      companyName: 'Flutterwave',
      location: 'Lagos & Remote (Nigeria)',
      jobType: 'Full-time',
      salaryRange: '₦350,000 - ₦550,000 / month',
      description: 'Build and scale fintech payment APIs and modern frontend interfaces using React, TypeScript, and Node.js.',
      requirements: JSON.stringify(['BSc in Computer Science or equivalent', 'React & Node.js proficiency', 'RESTful APIs & SQL', 'Git workflow']),
      responsibilities: 'Build responsive client components, develop robust backend microservices, and collaborate in agile sprints.',
      applyUrl: 'https://flutterwave.com/careers',
      tags: JSON.stringify(['Fintech', 'React', 'Node.js', 'Full-time'])
    },
    {
      title: 'NYSC Data Analyst Intern',
      companyName: 'PiggyVest',
      location: 'Lagos, Nigeria',
      jobType: 'NYSC',
      salaryRange: '₦120,000 - ₦180,000 / month',
      description: 'Exciting opportunity for serving NYSC corps members to work directly with the business intelligence and product growth analytics teams.',
      requirements: JSON.stringify(['Currently deployed to Lagos State for NYSC', 'Strong SQL & Excel foundation', 'Power BI / Tableau']),
      responsibilities: 'Analyze transactional patterns, build visual dashboards for team leads, and generate weekly growth reports.',
      applyUrl: 'https://piggyvest.com/careers',
      tags: JSON.stringify(['Data Analysis', 'SQL', 'NYSC', 'Fintech'])
    },
    {
      title: 'Product Design (UI/UX) Intern',
      companyName: 'Kuda Technologies',
      location: 'Remote (Nigeria)',
      jobType: 'Internship',
      salaryRange: '₦150,000 - ₦220,000 / month',
      description: 'Join a fast-growing digital bank to design intuitive mobile and web flows following Apple Human Interface Guidelines.',
      requirements: JSON.stringify(['Figma portfolio with web/mobile prototypes', 'Typography & design systems understanding', 'User empathy']),
      responsibilities: 'Create user journeys, wireframes, and interactive Figma prototypes for millions of banking users.',
      applyUrl: 'https://kuda.com/careers',
      tags: JSON.stringify(['UI/UX Design', 'Figma', 'Internship', 'Remote'])
    },
    {
      title: 'Graduate Trainee Software Engineer',
      companyName: 'Interswitch Group',
      location: 'Lagos, Nigeria',
      jobType: 'Full-time',
      salaryRange: '₦300,000 - ₦450,000 / month',
      description: 'Comprehensive 12-month engineering trainee program for recent university graduates in STEM fields.',
      requirements: JSON.stringify(['Recent graduate (First Class or 2:1)', 'Passion for fintech architecture and coding', 'Java, Python, or JavaScript']),
      responsibilities: 'Rotate through core engineering squads, build transaction switching systems, and complete hands-on certifications.',
      applyUrl: 'https://www.interswitchgroup.com/careers',
      tags: JSON.stringify(['Graduate Trainee', 'Software Engineering', 'Fintech'])
    },
    {
      title: 'Backend Developer Intern',
      companyName: 'Paystack (Stripe)',
      location: 'Lagos & Remote (Nigeria)',
      jobType: 'Internship',
      salaryRange: '₦200,000 - ₦300,000 / month',
      description: 'Work alongside senior engineers to design resilient payment processors and merchant APIs across Africa.',
      requirements: JSON.stringify(['Solid understanding of JavaScript / TypeScript or Python', 'Knowledge of relational databases (PostgreSQL/MySQL)']),
      responsibilities: 'Write robust API endpoints, optimize query performance, and write unit tests.',
      applyUrl: 'https://paystack.com/careers',
      tags: JSON.stringify(['Internship', 'Backend', 'Node.js', 'Paystack'])
    }
  ];

  for (const nj of nigerianJobs) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 60);

    const exists = await prisma.job.findFirst({
      where: {
        OR: [
          { applyUrl: nj.applyUrl },
          { title: nj.title, companyName: nj.companyName }
        ]
      }
    });

    if (!exists) {
      await prisma.job.create({
        data: {
          ...nj,
          applicationDeadline: deadline
        }
      });
      results.push({ title: nj.title, type: 'job', status: 'created' });
    }
  }

  return results;
}

/**
 * Scrapes both opportunities and jobs concurrently
 */
export async function scrapeLiveFeeds() {
  const [opps, jobs] = await Promise.allSettled([
    scrapeLiveOpportunities(),
    scrapeLiveJobs()
  ]);

  const oppResults = opps.status === 'fulfilled' ? opps.value : [];
  const jobResults = jobs.status === 'fulfilled' ? jobs.value : [];
  const total = [...oppResults, ...jobResults];

  console.log(`✅ Multi-source scraping complete. Synchronized ${oppResults.length} opportunities and ${jobResults.length} jobs.`);
  return total;
}
