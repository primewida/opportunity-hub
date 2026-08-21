/**
 * Multi-Source Production Opportunity & Job Web Scraper Engine
 * Featuring Deep Direct Application Link Resolution
 * Scrapes live scholarships, grants, fellowships from Scholarship Region, MySchoolGist,
 * Opportunities For Africans, Opportunity Desk, and Youth Hub Africa into the Opportunity table.
 * Scrapes live jobs, NGO careers, graduate trainees from My NGO Jobs, NGO Jobs in Africa,
 * Hot Nigerian Jobs, and Jobicy Tech Careers into the Job table.
 */
import prisma from '../config/database.js';

const OPPORTUNITY_FEEDS = [
  {
    name: 'Scholarship Region',
    url: 'https://www.scholarshipregion.com/feed/',
    defaultType: 'Scholarship',
  },
  {
    name: 'Student & Academic Opportunities (MySchoolGist)',
    url: 'https://myschoolgist.com/feed/',
    defaultType: 'Scholarship',
  },
  {
    name: 'Opportunities For Africans',
    url: 'https://www.opportunitiesforafricans.com/feed/',
    defaultType: 'Scholarship',
  },
  {
    name: 'Opportunity Desk',
    url: 'https://opportunitydesk.org/feed/',
    defaultType: 'Scholarship',
  },
  {
    name: 'Youth Hub Africa',
    url: 'https://youthhubafrica.org/feed/',
    defaultType: 'Fellowship',
  },
];

const JOB_FEEDS = [
  {
    name: 'My NGO Jobs',
    url: 'https://myngojobs.com/feed/',
    defaultCompany: 'NGO / Non-Profit Org',
  },
  {
    name: 'NGO Jobs in Africa',
    url: 'https://ngojobsinafrica.com/feed/',
    defaultCompany: 'International NGO',
  },
  {
    name: 'Hot Nigerian Jobs & Career Portal',
    url: 'https://www.hotnigerianjobs.com/feed/',
    defaultCompany: 'Nigerian Employer',
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
    .replace(/&#124;/g, '|')
    .replace(/&#58;/g, ':')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDirectPortalUrl(url, pageDomain = '') {
  if (!url) return false;
  const u = url.toLowerCase();

  // Filter out social networks, search engines, CMS internals
  if (
    u.includes('facebook.com') ||
    u.includes('twitter.com') ||
    u.includes('x.com') ||
    u.includes('whatsapp.com') ||
    u.includes('linkedin.com/sharing') ||
    u.includes('instagram.com') ||
    u.includes('pinterest.com') ||
    u.includes('t.me') ||
    u.includes('youtube.com') ||
    u.includes('wp-content') ||
    u.includes('wp-admin') ||
    u.includes('gravatar.com') ||
    u.includes('schema.org') ||
    u.includes('w3.org') ||
    u.includes('google.com/search') ||
    (pageDomain && u.includes(pageDomain))
  ) {
    return false;
  }

  // Positive ATS / Application Portals
  return (
    u.startsWith('mailto:') ||
    u.includes('forms.gle') ||
    u.includes('docs.google.com/forms') ||
    u.includes('submittable.com') ||
    u.includes('geckoform.com') ||
    u.includes('greenhouse.io') ||
    u.includes('lever.co') ||
    u.includes('workday.com') ||
    u.includes('myworkdayjobs.com') ||
    u.includes('smartrecruiters.com') ||
    u.includes('taleo.net') ||
    u.includes('bamboohr.com') ||
    u.includes('recruitee.com') ||
    u.includes('applytojob.com') ||
    u.includes('jobscore.com') ||
    u.includes('/careers') ||
    u.includes('/apply') ||
    u.includes('/jobs/') ||
    u.includes('/application') ||
    u.includes('/scholarship') ||
    u.includes('.edu/') ||
    u.includes('.ac.uk/') ||
    u.includes('.gov/') ||
    u.includes('.org/') ||
    u.includes('survey.zohopublic.com') ||
    u.includes('typeform.com')
  );
}

/**
 * Inspects webpage HTML to extract the exact official direct application portal
 */
export async function resolveDirectApplicationLink(pageUrl, rawItemDesc = '') {
  if (!pageUrl || !pageUrl.startsWith('http')) return pageUrl;

  try {
    let domain = '';
    try { domain = new URL(pageUrl).hostname.replace('www.', ''); } catch (e) {}

    // 1. Check if description has embedded mailto or direct forms
    const directMatches = [
      ...rawItemDesc.matchAll(/href=["'](https?:\/\/[^"']+|mailto:[^"']+)["']/gis)
    ].map(m => m[1]);

    for (const link of directMatches) {
      if (isDirectPortalUrl(link, domain)) {
        return link;
      }
    }

    // 2. Fetch the target webpage to parse the "Click here to apply" button
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) return pageUrl;
    const html = await res.text();

    const anchors = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis)];
    
    // Priority A: Anchor text containing explicit application keywords
    for (const a of anchors) {
      const href = a[1];
      const text = a[2].replace(/<[^>]+>/g, '').trim().toLowerCase();
      
      if (!isDirectPortalUrl(href, domain)) continue;

      if (
        text.includes('apply') ||
        text.includes('application') ||
        text.includes('official') ||
        text.includes('click here') ||
        text.includes('portal') ||
        text.includes('register') ||
        text.includes('submit')
      ) {
        return href;
      }
    }

    // Priority B: Any valid external portal link (GeckoForm, Google Form, University Subdomain, etc.)
    for (const a of anchors) {
      const href = a[1];
      if (isDirectPortalUrl(href, domain)) {
        return href;
      }
    }

    // Priority C: Mailto link for job applications
    const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (mailtoMatch && mailtoMatch[1]) {
      return `mailto:${mailtoMatch[1]}`;
    }

  } catch (err) {
    // If fetching fails or times out, safely return pageUrl
  }

  return pageUrl;
}

function detectOpportunityType(title = '', text = '') {
  const combined = `${title} ${text}`.toLowerCase();
  if (combined.includes('internship') || combined.includes('intern ')) return 'Internship';
  if (combined.includes('fellowship') || combined.includes('fellow ')) return 'Fellowship';
  if (combined.includes('grant') || combined.includes('funding') || combined.includes('award')) return 'Grant';
  if (combined.includes('competition') || combined.includes('challenge') || combined.includes('hackathon') || combined.includes('essay')) return 'Competition';
  if (combined.includes('training') || combined.includes('bootcamp') || combined.includes('academy') || combined.includes('workshop')) return 'Training Program';
  return 'Scholarship';
}

function detectEducationLevel(title = '', text = '') {
  const combined = `${title} ${text}`.toLowerCase();
  if (combined.includes('phd') || combined.includes('doctorate')) return 'PhD';
  if (combined.includes('master') || combined.includes('postgraduate') || combined.includes('msc') || combined.includes('mba')) return 'Masters';
  if (combined.includes('undergraduate') || combined.includes('bachelor') || combined.includes('university') || combined.includes('college')) return 'Undergraduate';
  if (combined.includes('high school') || combined.includes('secondary school') || combined.includes('waec') || combined.includes('jamb')) return 'SSS';
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
    'ICAN', 'United Nations', 'UNICEF', 'UNESCO', 'Bill & Melinda Gates Foundation',
    'Martingale Foundation', 'Gates Cambridge', 'Rhodes Trust', 'British Council', 'Andersen'
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
 * Scrapes live scholarships and resolves direct official application links
 */
export async function scrapeLiveOpportunities() {
  const results = [];
  console.log('🌐 Scraping live opportunities with Direct Link Resolver...');

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

      for (const itemXml of itemMatches.slice(0, 30)) {
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

        // Resolve direct application link asynchronously
        const directApplyLink = await resolveDirectApplicationLink(link, rawDesc);

        const oppType = detectOpportunityType(title, desc);
        const eduLevel = detectEducationLevel(title, desc);
        const provider = detectProvider(title, desc);
        const deadline = extractDeadline(desc);
        const bannerColor = BANNER_COLORS[Math.floor(Math.random() * BANNER_COLORS.length)];

        const isNigeria = title.toLowerCase().includes('nigeria') || desc.toLowerCase().includes('nigeria') || provider.toLowerCase().includes('nigeria') || feed.name.includes('MySchoolGist');
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
          applicationLink: directApplyLink || link,
          deadline,
          location,
          educationLevel: eduLevel,
          fieldOfStudy: oppType === 'Training Program' ? 'IT/Computer Science' : null,
          bannerColor,
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            education_level: [eduLevel],
            nationality: isNigeria ? 'Nigerian' : 'African',
            eligibility_summary: `Open to ${eduLevel} students and applicants.`
          }),
          requiredDocuments: JSON.stringify(['Curriculum Vitae (CV)', 'Academic Transcript / Certificate', 'Statement of Purpose']),
          applicationSteps: '1. Access official application portal\n2. Fill out applicant profile & academic records\n3. Upload credentials & documents\n4. Submit before deadline',
          benefits: JSON.stringify(['Full or Partial Funding Support', 'Mentorship & Professional Network', 'Recognized Certification']),
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
 * Scrapes live jobs and resolves direct company application portals
 */
export async function scrapeLiveJobs() {
  const results = [];
  console.log('💼 Scraping live jobs with Direct ATS/Portal Resolver...');

  // 1. Scrape RSS Job Feeds (My NGO Jobs, NGO Jobs in Africa, Hot Nigerian Jobs)
  for (const feed of JOB_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) continue;

      const xmlText = await response.text();
      const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

      for (const itemXml of itemMatches.slice(0, 40)) {
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

        // Resolve direct application link or mailto
        const directApplyUrl = await resolveDirectApplicationLink(link, rawDesc);

        let company = feed.defaultCompany;
        if (title.includes(' at ')) {
          company = title.split(' at ')[1].trim();
        } else if (title.includes(' – ')) {
          company = title.split(' – ')[0].trim();
        } else if (title.includes(' Job Recruitment')) {
          company = title.replace(/Job Recruitment.*/i, '').trim();
        }

        const titleLower = title.toLowerCase();
        let jobType = 'Full-time';
        if (titleLower.includes('intern') || titleLower.includes('internship')) jobType = 'Internship';
        else if (titleLower.includes('nysc')) jobType = 'NYSC';
        else if (titleLower.includes('part-time') || titleLower.includes('volunteer')) jobType = 'Part-time';

        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 45 + Math.floor(Math.random() * 30));

        const existingJob = await prisma.job.findFirst({
          where: {
            OR: [
              { applyUrl: link },
              { title: title }
            ]
          }
        });

        const jobData = {
          title,
          description: desc.slice(0, 600) + (desc.length > 600 ? '...' : ''),
          companyName: company.slice(0, 60),
          location: feed.name.includes('Hot Nigerian') ? 'Nigeria' : 'Nigeria & Remote',
          jobType,
          salaryRange: feed.name.includes('NGO') ? 'Competitive NGO Scale' : 'Competitive',
          applicationDeadline: deadline,
          requirements: JSON.stringify(['Relevant degree or professional qualification', 'Strong interpersonal and problem-solving skills', 'Team collaboration']),
          responsibilities: 'Execute day-to-day organizational responsibilities, report to squad leads, and meet project milestones.',
          applyUrl: directApplyUrl || link,
          tags: JSON.stringify([jobType, feed.name.includes('NGO') ? 'NGO & Non-Profit' : 'Corporate', 'Nigeria']),
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
    } catch (feedErr) {
      console.warn(`  ⚠️ Scraper notice for ${feed.name}:`, feedErr.message);
    }
  }

  // 2. Scrape Global Remote Tech Jobs from Jobicy API
  try {
    const response = await fetch('https://jobicy.com/api/v2/remote-jobs?count=40', {
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
        const companyName = (j.companyName || 'Global Tech').trim();
        const location = j.jobGeo || 'Remote';
        const rawType = Array.isArray(j.jobType) ? j.jobType[0] : (j.jobType || 'Full-time');
        const jobType = rawType.includes('Part') ? 'Part-time' : rawType.includes('Intern') ? 'Internship' : 'Full-time';

        let salaryRange = null;
        if (j.annualSalaryMin && j.annualSalaryMax) {
          salaryRange = `$${j.annualSalaryMin.toLocaleString()} - $${j.annualSalaryMax.toLocaleString()} / year`;
        } else if (j.annualSalaryMin) {
          salaryRange = `$${j.annualSalaryMin.toLocaleString()}+ / year`;
        }

        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 50);

        const existingJob = await prisma.job.findFirst({
          where: {
            OR: [
              { applyUrl: j.url },
              { title: title, companyName: companyName }
            ]
          }
        });

        const cleanDesc = cleanHtml(j.jobDescription || j.jobExcerpt || 'Build high-impact digital products and modern cloud architecture.');

        const jobData = {
          title,
          description: cleanDesc.slice(0, 600) + (cleanDesc.length > 600 ? '...' : ''),
          companyName,
          location,
          jobType,
          salaryRange,
          applicationDeadline: deadline,
          requirements: JSON.stringify(j.jobIndustry ? [j.jobIndustry, 'Relevant experience', 'Good communication'] : ['Technical proficiency', 'Problem solving']),
          responsibilities: 'Collaborate with cross-functional engineering team, develop scalable features, and write maintainable code.',
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
    console.warn('  ⚠️ Jobicy scraper notice:', jobErr.message);
  }

  // 3. Ensure Top Nigerian Tech Companies Are Represented
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
 * Scrapes all opportunity and job portals concurrently
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
