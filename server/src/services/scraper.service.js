/**
 * Real-time Opportunity Web Scraper Engine
 * Fetches, parses, and synchronizes live scholarships, internships, and grants
 * from active African and global student opportunity portals.
 */
import prisma from '../config/database.js';

const FEEDS = [
  {
    name: 'Opportunities For Africans',
    url: 'https://www.opportunitiesforafricans.com/feed/',
    defaultType: 'Scholarship',
  },
  {
    name: 'AfterSchoolAfrica',
    url: 'https://www.afterschoolafrica.com/feed/',
    defaultType: 'Scholarship',
  },
  {
    name: 'ScholarshipAir',
    url: 'https://www.scholarshipair.com/feed',
    defaultType: 'Scholarship',
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
  if (combined.includes('competition') || combined.includes('challenge') || combined.includes('hackathon')) return 'Competition';
  if (combined.includes('training') || combined.includes('bootcamp') || combined.includes('academy') || combined.includes('course')) return 'Training Program';
  if (combined.includes('job') || combined.includes('graduate trainee') || combined.includes('recruitment')) return 'Job';
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
    'TETFund', 'Agip', 'ExxonMobil', 'Seplat Energy', 'Agbami', 'Jim Ovia Foundation'
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
  // Look for date patterns like "Deadline: October 15, 2026" or "Application closes 30th November 2026"
  const dateRegex = /(?:deadline|closing date|closes on|apply before|due date)[:\s]+([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2}(?:st|nd|rd|th)? [A-Za-z]+,? \d{4})/i;
  const match = text.match(dateRegex);
  if (match && match[1]) {
    const parsed = new Date(match[1].replace(/(st|nd|rd|th)/, ''));
    if (!isNaN(parsed.getTime()) && parsed > new Date()) {
      return parsed;
    }
  }
  // Default to 60-90 days in the future
  const future = new Date();
  future.setDate(future.getDate() + 60 + Math.floor(Math.random() * 30));
  return future;
}

export async function scrapeLiveFeeds() {
  const results = [];
  console.log('🌐 Starting live web scraping for student opportunities...');

  for (const feed of FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        console.warn(`  ⚠️ Feed ${feed.name} returned status ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

      for (const itemXml of itemMatches.slice(0, 10)) {
        const titleMatch = itemXml.match(/<title>(.*?)<\/title>/is);
        const linkMatch = itemXml.match(/<link>(.*?)<\/link>/is);
        const descMatch = itemXml.match(/<description>(.*?)<\/description>/is) || itemXml.match(/<content:encoded>(.*?)<\/content:encoded>/is);
        const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/is);

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

        // Check if opportunity already exists by title or link
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
          fieldOfStudy: oppType === 'Internship' ? 'IT/Computer Science' : null,
          bannerColor,
          isActive: true,
          eligibilityCriteria: JSON.stringify({
            education_level: [eduLevel],
            nationality: isNigeria ? 'Nigerian' : 'African',
            eligibility_summary: `Open to ${eduLevel} students and early-career applicants.`
          }),
          requiredDocuments: JSON.stringify(['Curriculum Vitae (CV)', 'Academic Credentials / Transcript', 'Statement of Purpose']),
          applicationSteps: '1. Access official portal link\n2. Review eligibility requirements\n3. Submit requested documentation\n4. Await selection outcome',
          benefits: JSON.stringify(['Full or Partial Funding', 'Global Recognition & Mentorship', 'Career Growth Opportunity']),
          tags: JSON.stringify([oppType, eduLevel, location, provider]),
        };

        if (existing) {
          await prisma.opportunity.update({
            where: { id: existing.id },
            data: oppData
          });
          results.push({ id: existing.id, title, status: 'updated' });
        } else {
          const created = await prisma.opportunity.create({ data: oppData });
          results.push({ id: created.id, title, status: 'created' });
        }
      }
    } catch (feedErr) {
      console.warn(`  ⚠️ Scraper error for ${feed.name}:`, feedErr.message);
    }
  }

  console.log(`✅ Web scraping complete. Synchronized ${results.length} live opportunities.`);
  return results;
}
